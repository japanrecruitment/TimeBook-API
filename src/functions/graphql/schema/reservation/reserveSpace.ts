import { IFieldResolver } from "@graphql-tools/utils";
import { StripeLib } from "@libs/paymentProvider";
import {
    addEmailToQueue,
    ReservationCompletedData,
    ReservationFailedData,
    ReservationPendingData,
    ReservationReceivedData,
} from "@utils/email-helper";
import { appConfig } from "@utils/appConfig";
import { Log } from "@utils/logger";
import { omit } from "@utils/object-helper";
import { gql } from "apollo-server-core";
import Stripe from "stripe";
import { Context } from "../../context";
import { GqlError } from "../../error";
import { getDurationsBetn } from "@utils/date-utils";
import ReservationPriceCalculator from "./ReservationPriceCalculator";
import { SpacePricePlanType } from "@prisma/client";
import moment from "moment";
import { environment } from "@utils/environment";
import { differenceWith, isEmpty, sum } from "lodash";
import { expoSendNotification } from "@utils/notification";
import { fetchDeviceId } from "@utils/notification/fetch-device-id";

type SelectedAdditionalOption = {
    optionId: string;
    quantity: number;
};

type ReserveSpaceInput = {
    duration: number;
    durationType: SpacePricePlanType;
    fromDateTime: Date;
    paymentSourceId: string;
    spaceId: string;
    additionalOptions?: SelectedAdditionalOption[];
    useSubscription?: boolean;
};

type ReserveSpaceArgs = { input: ReserveSpaceInput };

type ReserveSpaceResult = {
    transactionId: string;
    intentId: string;
    intentCode: string;
    amount: number;
    description: string;
    currency: string;
    subscriptionPrice: number;
    subscriptionUnit: number;
    paymentMethodTypes: string[];
};

type ReserveSpace = IFieldResolver<any, Context, ReserveSpaceArgs, Promise<ReserveSpaceResult>>;

const reserveSpace: ReserveSpace = async (_, { input }, { authData, store }) => {
    const { id: userId, accountId, email } = authData;
    if (!accountId || !email || !userId) throw new GqlError({ code: "FORBIDDEN", message: "Invalid token!!" });

    const { paymentSourceId, spaceId, duration, durationType, additionalOptions, useSubscription } = input;
    const fromDateTime = input.fromDateTime;

    try {
        Log(fromDateTime, duration);
        if (fromDateTime.getTime() < Date.now())
            throw new GqlError({ code: "BAD_USER_INPUT", message: "Invalid from date." });

        if (duration <= 0) throw new GqlError({ code: "BAD_USER_INPUT", message: "Invalid duration." });

        const durationUnit: Record<SpacePricePlanType, "days" | "hours" | "minutes"> = {
            DAILY: "days",
            HOURLY: "hours",
            MINUTES: "minutes",
        };

        let toDateTime = moment(fromDateTime).add(duration, durationUnit[durationType]).toDate();

        const { days, hours, minutes } = getDurationsBetn(fromDateTime, toDateTime);

        Log("reserveSpace: durations:", days, hours, minutes);

        if (days <= 0 && hours <= 0 && minutes < 5)
            throw new GqlError({ code: "BAD_USER_INPUT", message: "Invalid date selection" });

        additionalOptions?.forEach(({ quantity }) => {
            if (quantity && quantity < 0)
                throw new GqlError({ code: "BAD_USER_INPUT", message: "Invalid option quantity" });
        });

        const user = await store.user.findUnique({ where: { id: userId }, select: { stripeCustomerId: true } });
        if (!user) throw new GqlError({ code: "BAD_REQUEST", message: "User not found" });
        if (!user.stripeCustomerId) throw new GqlError({ code: "BAD_REQUEST", message: "Stripe account not found" });

        const space = await store.space.findFirst({
            where: { id: spaceId, isDeleted: false, published: true },
            include: {
                account: { include: { host: true } },
                additionalOptions: additionalOptions
                    ? { where: { id: { in: additionalOptions.map(({ optionId }) => optionId) } } }
                    : undefined,
                reservations: {
                    where: {
                        AND: [
                            { spaceId },
                            { status: { notIn: ["CANCELED", "DISAPPROVED", "FAILED"] } },
                            {
                                OR: [
                                    {
                                        AND: [
                                            { fromDateTime: { lte: fromDateTime } },
                                            { toDateTime: { gte: toDateTime } },
                                        ],
                                    },
                                    {
                                        AND: [
                                            { fromDateTime: { gte: fromDateTime } },
                                            { fromDateTime: { lte: toDateTime } },
                                        ],
                                    },
                                    {
                                        AND: [
                                            { toDateTime: { gte: fromDateTime } },
                                            { toDateTime: { lte: toDateTime } },
                                        ],
                                    },
                                ],
                            },
                        ],
                    },
                },
                settings: {
                    where: {
                        OR: [
                            { isDefault: true },
                            { AND: [{ fromDate: { lte: fromDateTime } }, { toDate: { gte: toDateTime } }] },
                            { AND: [{ fromDate: { gte: fromDateTime } }, { fromDate: { lte: toDateTime } }] },
                            { AND: [{ toDate: { gte: fromDateTime } }, { toDate: { lte: toDateTime } }] },
                        ],
                    },
                },
            },
        });

        if (!space) throw new GqlError({ code: "NOT_FOUND", message: "Space not found" });

        Log("reserveSpace: space:", space);

        const { reservations, settings } = space;

        const totalStock = settings && settings.length > 0 ? settings[settings.length - 1].totalStock : 1;

        if (reservations && reservations.length >= totalStock)
            throw new GqlError({
                code: "BAD_USER_INPUT",
                message: "Reservation is not available for this space in the selected time frame",
            });

        const stripe = new StripeLib();
        const paymentMethod = await stripe.retrievePaymentMethod(paymentSourceId);
        const customerId = user.stripeCustomerId;
        if (paymentMethod.customer !== customerId)
            throw new GqlError({ code: "NOT_FOUND", message: "Invalid payment source." });

        let remSubscriptionUnit: number = undefined;
        if (useSubscription) {
            const stripeSubs = await stripe.listSubscriptions(accountId, "rental-space");
            if (stripeSubs.length > 1) {
                throw new GqlError({
                    code: "FORBIDDEN",
                    message:
                        "Multiple subscription of space type found in your account. Please contact our support team",
                });
            }
            if (stripeSubs.length === 1) {
                const subscription = stripeSubs[0];
                const subsPeriodEnd = new Date(subscription.current_period_end);
                const subsPeriodStart = new Date(subscription.current_period_start);
                const reservations = await store.reservation.aggregate({
                    where: {
                        reserveeId: accountId,
                        subscriptionUnit: { not: null },
                        subscriptionPrice: { not: null },
                        status: { notIn: ["HOLD", "CANCELED", "DISAPPROVED", "FAILED"] },
                        AND: [{ createdAt: { gte: subsPeriodStart } }, { createdAt: { lte: subsPeriodEnd } }],
                    },
                    _sum: { subscriptionUnit: true },
                });
                const totalUnit = parseInt(subscription.items.data[0].price.product.metadata.unit);
                const usedUnit = reservations._sum.subscriptionUnit;
                remSubscriptionUnit = usedUnit > totalUnit ? undefined : totalUnit - usedUnit;
            }
        }

        const totalReservationHours = (toDateTime.getTime() - fromDateTime.getTime()) / 3600000;
        const subscriptionUnit = remSubscriptionUnit
            ? remSubscriptionUnit < Math.ceil(totalReservationHours)
                ? remSubscriptionUnit
                : Math.ceil(totalReservationHours)
            : undefined;
        // Calculating subscription price
        let subscriptionPrice =
            subscriptionUnit && subscriptionUnit > 0 ? space.subcriptionPrice * subscriptionUnit : undefined;
        Log("applied subscription", totalReservationHours, remSubscriptionUnit, subscriptionUnit, subscriptionPrice);

        let amount = 0;

        const hasRemDates = totalReservationHours - (subscriptionUnit || 0) > 0;

        Log("hasRemDates", hasRemDates);
        Log("totalReservationHours", totalReservationHours);
        Log("subscriptionUnit", subscriptionUnit);

        if (hasRemDates) {
            const newFromDateTime = moment(fromDateTime).add(subscriptionUnit, "hours").toDate();
            const pricePlans = await store.spacePricePlan.findMany({
                where: {
                    spaceId,
                    isDeleted: false,
                    type: durationType,
                    duration: { lte: duration },
                    OR: [
                        { isDefault: true },
                        {
                            AND: [{ fromDate: { gte: newFromDateTime } }, { fromDate: { lte: toDateTime } }],
                        },
                        {
                            AND: [{ toDate: { gte: newFromDateTime } }, { toDate: { lte: toDateTime } }],
                        },
                    ],
                },
                include: { overrides: true },
            });

            Log("price plans: ", pricePlans);

            if (!pricePlans || pricePlans.length <= 0)
                throw new GqlError({
                    code: "BAD_USER_INPUT",
                    message: "Selected time frame doesn't satisfy the minimum required duration to book this space.",
                });

            // Calculate reservation price
            const { price } = new ReservationPriceCalculator({
                checkIn: newFromDateTime,
                checkOut: toDateTime,
                pricePlans,
            });
            amount = price;
        }

        if (!isEmpty(additionalOptions) && !isEmpty(space.additionalOptions)) {
            differenceWith(
                additionalOptions,
                space.additionalOptions,
                ({ optionId }, { id }) => optionId === id
            ).forEach(({ optionId }) => {
                throw new GqlError({
                    code: "BAD_USER_INPUT",
                    message: `Option with id ${optionId} not found in the plan.`,
                });
            });
            const selectedOptions = space.additionalOptions.map((aOpts) => {
                const bOpt = additionalOptions.find(({ optionId }) => optionId === aOpts.id);
                if ((aOpts.paymentTerm === "PER_PERSON" || aOpts.paymentTerm === "PER_USE") && !bOpt.quantity) {
                    throw new GqlError({ code: "BAD_USER_INPUT", message: "Missing option quantity" });
                }
                return { ...aOpts, quantity: bOpt.quantity };
            });
            // Calculating option price
            selectedOptions.forEach(({ paymentTerm, quantity, additionalPrice }) => {
                if (additionalPrice && additionalPrice > 0) {
                    if (paymentTerm === "PER_PERSON" || paymentTerm === "PER_USE") amount += quantity * additionalPrice;
                    else amount += additionalPrice;
                }
            });
        }

        Log("applied amount", amount);

        // Create unique reservation Id
        const reservationId = "PS" + Math.floor(100000 + Math.random() * 900000);

        const notificationTokens = await fetchDeviceId([accountId, space.accountId]);

        await Promise.all([
            addEmailToQueue<ReservationReceivedData>({
                template: "reservation-received",
                recipientEmail: email,
                recipientName: "",
                spaceId,
                reservationId,
            }),
            addEmailToQueue<ReservationReceivedData>({
                template: "reservation-received",
                recipientEmail: space.account.email,
                recipientName: "",
                spaceId,
                reservationId,
            }),
            expoSendNotification([{ tokens: notificationTokens, body: "Reservation Received" }]),
        ]);

        const transaction = await store.transaction.create({
            data: {
                amount,
                provider: "STRIPE",
                assetType: "SPACE",
                assetData: omit(
                    space,
                    "createdAt",
                    "account",
                    "additionalOptions",
                    "updatedAt",
                    "reservations",
                    "settings"
                ),
                currency: "JPY",
                description: `Reservation of ${space.name}`,
                status: "CREATED",
                brand: paymentMethod.card.brand,
                lastAuthorizedDate: new Date(),
                account: { connect: { id: accountId } },
                reservation: {
                    create: {
                        approved: !space.needApproval,
                        approvedOn: !space.needApproval ? new Date() : null,
                        fromDateTime,
                        toDateTime,
                        status: "PENDING",
                        space: { connect: { id: spaceId } },
                        reservee: { connect: { id: accountId } },
                        reservationId,
                        subscriptionPrice,
                        subscriptionUnit,
                    },
                },
            },
        });

        let paymentIntent: Stripe.PaymentIntent;
        if (amount > 0) {
            const applicationFeeAmount = parseInt((amount * (appConfig.platformFeePercent / 100)).toString());
            const transferAmount = amount - applicationFeeAmount;
            Log(amount, applicationFeeAmount, transferAmount);

            const paymentIntentParams: Stripe.PaymentIntentCreateParams = {
                amount,
                currency: "JPY",
                customer: paymentMethod.customer,
                payment_method: paymentMethod.id,
                payment_method_types: [paymentMethod.type],
                description: transaction.description,
                receipt_email: email,
                capture_method: "manual",
                metadata: {
                    transactionId: transaction.id,
                    reservationId: transaction.reservationId,
                    userId: accountId,
                    spaceId: spaceId,
                },
                statement_descriptor: `AUTH_${environment.APP_READABLE_NAME}`.substring(0, 22),
                application_fee_amount: applicationFeeAmount,
                transfer_data: { destination: space.account.host.stripeAccountId },
                confirm: true,
            };

            paymentIntent = await stripe.createPaymentIntent(paymentIntentParams);

            if (!paymentIntent?.id) {
                await store.transaction.update({
                    where: { id: transaction.id },
                    data: {
                        requestedLog: paymentIntentParams as any,
                        failedLog: paymentIntent as any,
                        reservation: { update: { status: "FAILED" } },
                    },
                });
                throw new GqlError({ code: "BAD_REQUEST", message: "Couldn't create a payment intent" });
            }

            await store.transaction.update({
                where: { id: transaction.id },
                data: {
                    paymentIntentId: paymentIntent.id,
                    requestedLog: paymentIntentParams as any,
                    responseReceivedLog: paymentIntent as any,
                },
            });
        }

        if (!space.needApproval) {
            await Promise.all([
                addEmailToQueue<ReservationCompletedData>({
                    template: "reservation-completed",
                    recipientEmail: email,
                    recipientName: "",
                    spaceId,
                    reservationId,
                }),
                expoSendNotification([{ tokens: notificationTokens, body: "Reservation Complete" }]),
            ]);
        } else {
            await Promise.all([
                addEmailToQueue<ReservationPendingData>({
                    template: "reservation-pending",
                    recipientEmail: email,
                    recipientName: "",
                    spaceId,
                    reservationId,
                }),
                addEmailToQueue<ReservationPendingData>({
                    template: "reservation-pending",
                    recipientEmail: space.account.email,
                    recipientName: "",
                    spaceId,
                    reservationId,
                }),
                expoSendNotification([{ tokens: notificationTokens, body: "Reservation Pending" }]),
            ]);
        }

        return {
            transactionId: transaction.id,
            intentId: paymentIntent?.id,
            intentCode: paymentIntent?.client_secret,
            amount: paymentIntent?.amount,
            description: paymentIntent?.description,
            currency: paymentIntent?.currency,
            paymentMethodTypes: paymentIntent?.payment_method_types,
            reservationId,
            subscriptionPrice,
            subscriptionUnit,
        };
    } catch (error) {
        await Promise.all([
            addEmailToQueue<ReservationFailedData>({
                template: "reservation-failed",
                recipientEmail: email,
                recipientName: "",
                spaceId,
            }),
        ]);
        throw error;
    }
};

export const reserveSpaceTypeDefs = gql`
    input SelectedAdditionalOption {
        optionId: ID!
        quantity: Int
    }

    input ReserveSpaceInput {
        duration: Int!
        durationType: SpacePricePlanType!
        fromDateTime: Date!
        paymentSourceId: ID!
        spaceId: ID!
        additionalOptions: [SelectedAdditionalOption]
        useSubscription: Boolean
    }

    type ReserveSpaceResult {
        transactionId: ID
        intentId: ID
        intentCode: String
        amount: Float
        description: String
        currency: String
        paymentMethodTypes: [String]
        reservationId: String
        subscriptionUnit: Int
        subscriptionPrice: Int
    }

    type Mutation {
        reserveSpace(input: ReserveSpaceInput): ReserveSpaceResult @auth(requires: [user, host])
    }
`;

export const reserveSpaceResolvers = {
    Mutation: { reserveSpace },
};
