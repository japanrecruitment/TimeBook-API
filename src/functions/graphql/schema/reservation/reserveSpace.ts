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
import { formatPrice } from "@utils/stringHelper";
import { gql } from "apollo-server-core";
import Stripe from "stripe";
import { Context } from "../../context";
import { GqlError } from "../../error";
import { getDurationsBetn } from "@utils/date-utils";
import ReservationPriceCalculator from "./ReservationPriceCalculator";

type ReserveSpaceInput = {
    fromDateTime: Date;
    paymentSourceId: string;
    spaceId: string;
    toDateTime: Date;
};

type ReserveSpaceArgs = { input: ReserveSpaceInput };

type ReserveSpaceResult = {
    transactionId: string;
    intentId: string;
    intentCode: string;
    amount: number;
    description: string;
    currency: string;
    paymentMethodTypes: string[];
};

type ReserveSpace = IFieldResolver<any, Context, ReserveSpaceArgs, Promise<ReserveSpaceResult>>;

const reserveSpace: ReserveSpace = async (_, { input }, { authData, store }) => {
    const { id: userId, accountId, email } = authData;
    const { fromDateTime, paymentSourceId, spaceId, toDateTime } = input;
    try {
        Log(fromDateTime, toDateTime);
        if (fromDateTime.getTime() < Date.now() || toDateTime.getTime() < Date.now())
            throw new GqlError({ code: "BAD_USER_INPUT", message: "Selected time frame is invalid" });

        const { days, hours, minutes } = getDurationsBetn(fromDateTime, toDateTime);

        Log("reserveSpace: durations:", days, hours, minutes);

        if (days <= 0 && hours <= 0 && minutes < 5)
            throw new GqlError({ code: "BAD_USER_INPUT", message: "Invalid date selection" });

        const space = await store.space.findFirst({
            where: { id: spaceId, isDeleted: false },
            include: {
                account: { include: { host: true } },
                pricePlans: {
                    where: {
                        AND: [
                            { isDeleted: false },
                            {
                                OR: [
                                    { type: "DAILY", duration: { lte: days } },
                                    { type: "HOURLY", duration: { lte: hours } },
                                    { type: "MINUTES", duration: { lte: minutes } },
                                ],
                            },
                            {
                                OR: [
                                    { isDefault: true },
                                    { fromDate: { lte: toDateTime } },
                                    { toDate: { lte: toDateTime } },
                                ],
                            },
                        ],
                    },
                },
                reservations: {
                    where: {
                        OR: [
                            { AND: [{ fromDateTime: { lte: fromDateTime } }, { toDateTime: { gte: toDateTime } }] },
                            { AND: [{ fromDateTime: { gte: fromDateTime } }, { fromDateTime: { lte: toDateTime } }] },
                            { AND: [{ toDateTime: { gte: fromDateTime } }, { toDateTime: { lte: toDateTime } }] },
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

        const { pricePlans, reservations, settings } = space;

        const totalStock = settings && settings.length > 0 ? settings[settings.length - 1].totalStock : 1;

        if (reservations && reservations.length >= totalStock)
            throw new GqlError({
                code: "BAD_USER_INPUT",
                message: "Reservation is not available for this space in the selected time frame",
            });

        if (!pricePlans || pricePlans.length <= 0)
            throw new GqlError({
                code: "BAD_USER_INPUT",
                message: "Selected time frame doesn't satisfy the minimum required duration to book this space.",
            });

        const stripe = new StripeLib();
        const paymentMethod = await stripe.retrievePaymentMethod(paymentSourceId);
        const customerId = (
            await store.user.findUnique({
                where: { id: userId },
                select: { stripeCustomerId: true },
            })
        )?.stripeCustomerId;

        if (paymentMethod.customer !== customerId)
            throw new GqlError({
                code: "NOT_FOUND",
                message: "Invalid payment source.",
            });

        const { price } = new ReservationPriceCalculator({ checkIn: fromDateTime, checkOut: toDateTime, pricePlans });
        const amount = price;
        const applicationFeeAmount = parseInt((amount * (appConfig.platformFeePercent / 100)).toString());
        const transferAmount = amount - applicationFeeAmount;

        const reservationId = "TB" + Math.floor(100000 + Math.random() * 900000);

        Log(amount, applicationFeeAmount, transferAmount);

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
        ]);

        const transaction = await store.transaction.create({
            data: {
                amount,
                provider: "STRIPE",
                assetType: "SPACE",
                assetData: omit(space, "createdAt", "account", "pricePlans", "updatedAt", "reservations", "settings"),
                currency: "JPY",
                description: `Reservation of ${space.name}`,
                status: "CREATED",
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
                    },
                },
            },
        });

        const paymentIntentParams: Stripe.PaymentIntentCreateParams = {
            amount,
            currency: "JPY",
            customer: paymentMethod.customer,
            payment_method: paymentMethod.id,
            payment_method_types: [paymentMethod.type],
            description: transaction.description,
            receipt_email: email,
            capture_method: space.needApproval ? "manual" : "automatic",
            metadata: {
                transactionId: transaction.id,
                reservationId: transaction.reservationId,
                userId: accountId,
                spaceId: spaceId,
            },
            application_fee_amount: applicationFeeAmount,
            transfer_data: {
                destination: space.account.host.stripeAccountId,
            },
            confirm: true,
        };

        const paymentIntent = await stripe.createPaymentIntent(paymentIntentParams);

        await store.transaction.update({
            where: { id: transaction.id },
            data: {
                paymentIntentId: paymentIntent.id,
                requestedLog: paymentIntentParams as any,
                responseReceivedLog: paymentIntent as any,
            },
        });

        if (!space.needApproval) {
            await addEmailToQueue<ReservationCompletedData>({
                template: "reservation-completed",
                recipientEmail: email,
                recipientName: "",
                spaceId,
                reservationId,
            });
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
            ]);
        }

        return {
            transactionId: transaction.id,
            intentId: paymentIntent.id,
            intentCode: paymentIntent.client_secret,
            amount: paymentIntent.amount,
            description: paymentIntent.description,
            currency: paymentIntent.currency,
            paymentMethodTypes: paymentIntent.payment_method_types,
            reservationId,
        };
    } catch (error) {
        await addEmailToQueue<ReservationFailedData>({
            template: "reservation-failed",
            recipientEmail: email,
            recipientName: "",
            spaceId,
        });
        throw error;
    }
};

export const reserveSpaceTypeDefs = gql`
    input ReserveSpaceInput {
        fromDateTime: Date!
        paymentSourceId: ID!
        spaceId: ID!
        toDateTime: Date!
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
    }

    type Mutation {
        reserveSpace(input: ReserveSpaceInput): ReserveSpaceResult @auth(requires: [user, host])
    }
`;

export const reserveSpaceResolvers = {
    Mutation: { reserveSpace },
};
