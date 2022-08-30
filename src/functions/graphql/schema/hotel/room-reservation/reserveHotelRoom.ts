import { IFieldResolver } from "@graphql-tools/utils";
import { StripeLib } from "@libs/paymentProvider";
import {
    addEmailToQueue,
    ReservationFailedData,
    ReservationPendingData,
    ReservationReceivedData,
} from "@utils/email-helper";
import { appConfig } from "@utils/appConfig";
import { Log } from "@utils/logger";
import { omit } from "@utils/object-helper";
import { gql } from "apollo-server-core";
import Stripe from "stripe";
import { Context } from "../../../context";
import { GqlError } from "../../../error";
import { getAllDatesBetn } from "@utils/date-utils";
import moment from "moment";
import { environment } from "@utils/environment";
import { differenceWith, intersectionWith, isEmpty, sum } from "lodash";
import { mapNumAdultField, mapNumChildField } from "../price-scheme";

function isEqualDate(a: Date, b: Date) {
    return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function validateReserveHotelRoomInput(input: ReserveHotelRoomInput): ReserveHotelRoomInput {
    let { checkInDate, checkOutDate, additionalOptions, ...others } = input;

    if (checkOutDate < checkInDate) throw new GqlError({ code: "BAD_USER_INPUT", message: "Invalid date selections" });

    if (checkInDate < moment().subtract(1, "days").toDate())
        throw new GqlError({ code: "BAD_USER_INPUT", message: "Invalid date selections" });

    checkOutDate = moment(checkOutDate).subtract(1, "days").toDate();

    additionalOptions?.forEach(({ quantity }) => {
        if (quantity && quantity < 0)
            throw new GqlError({ code: "BAD_USER_INPUT", message: "Invalid option quantity" });
    });

    return { checkInDate, checkOutDate, additionalOptions, ...others };
}

type SelectedAdditionalOption = {
    optionId: string;
    quantity: number;
};

type ReserveHotelRoomInput = {
    roomPlanId: string;
    paymentSourceId: string;
    checkInDate: Date;
    checkOutDate: Date;
    nAdult?: number;
    nChild?: number;
    additionalOptions?: SelectedAdditionalOption[];
    useSubscription?: boolean;
};

type ReserveHotelRoomArgs = { input: ReserveHotelRoomInput };

type ReserveHotelRoomResult = {
    amount: number;
    currency: string;
    description: string;
    intentCode: string;
    intentId: string;
    paymentMethodTypes: string[];
    reservationId: string;
    subscriptionPrice: number;
    subscriptionUnit: number;
    transactionId: string;
};

type ReserveHotelRoom = IFieldResolver<any, Context, ReserveHotelRoomArgs, Promise<ReserveHotelRoomResult>>;

const reserveHotelRoom: ReserveHotelRoom = async (_, { input }, { authData, store }) => {
    const { accountId, email, id: userId } = authData;
    if (!accountId || !email || !userId) throw new GqlError({ code: "FORBIDDEN", message: "Invalid token!!" });

    const validInput = validateReserveHotelRoomInput(input);
    Log(validInput);
    const { checkInDate, checkOutDate, paymentSourceId, roomPlanId, additionalOptions, nAdult, nChild } = validInput;

    try {
        const user = await store.user.findUnique({ where: { id: userId }, select: { stripeCustomerId: true } });
        if (!user) throw new GqlError({ code: "BAD_REQUEST", message: "User not found" });
        if (!user.stripeCustomerId) throw new GqlError({ code: "BAD_REQUEST", message: "Stripe account not found" });

        const stripe = new StripeLib();
        let remSubscriptionUnit: number = undefined;
        if (validInput.useSubscription) {
            const stripeSubs = await stripe.listSubscriptions(accountId, "hotel");
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
                const reservations = await store.hotelRoomReservation.aggregate({
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

        const allReservationDates = getAllDatesBetn(checkInDate, checkOutDate);

        const totalReservationUnits = allReservationDates.length;
        const subscriptionUnit = !remSubscriptionUnit
            ? remSubscriptionUnit < totalReservationUnits
                ? remSubscriptionUnit
                : totalReservationUnits
            : undefined;

        allReservationDates.splice(0, subscriptionUnit);

        Log(remSubscriptionUnit, subscriptionUnit, totalReservationUnits, allReservationDates);

        const plan = await store.hotelRoom_PackagePlan.findUnique({
            where: { id: roomPlanId },
            select: {
                packagePlan: {
                    select: {
                        id: true,
                        paymentTerm: true,
                        additionalOptions: !isEmpty(additionalOptions)
                            ? {
                                  where: { id: { in: additionalOptions.map(({ optionId }) => optionId) } },
                              }
                            : undefined,
                        reservations: {
                            where: {
                                OR: [
                                    {
                                        AND: [
                                            { fromDateTime: { gte: checkInDate } },
                                            { fromDateTime: { lte: checkOutDate } },
                                        ],
                                    },
                                    {
                                        AND: [
                                            { toDateTime: { gte: checkInDate } },
                                            { toDateTime: { lte: checkOutDate } },
                                        ],
                                    },
                                ],
                            },
                            select: { id: true },
                        },
                        stock: true,
                        stockOverrides: {
                            where: {
                                OR: [
                                    { AND: [{ endDate: { gte: checkInDate } }, { endDate: { lte: checkOutDate } }] },
                                    {
                                        AND: [
                                            { startDate: { gte: checkInDate } },
                                            { startDate: { lte: checkOutDate } },
                                        ],
                                    },
                                ],
                            },
                            select: { id: true, endDate: true, startDate: true, stock: true },
                        },
                        subcriptionPrice: true,
                    },
                },
                hotelRoom: {
                    include: {
                        hotel: { select: { account: { select: { id: true, email: true, host: true } }, status: true } },
                        reservations: {
                            where: {
                                OR: [
                                    {
                                        AND: [
                                            { fromDateTime: { gte: checkInDate } },
                                            { fromDateTime: { lte: checkOutDate } },
                                        ],
                                    },
                                    {
                                        AND: [
                                            { toDateTime: { gte: checkInDate } },
                                            { toDateTime: { lte: checkOutDate } },
                                        ],
                                    },
                                ],
                            },
                            select: { id: true },
                        },
                        stockOverrides: {
                            where: {
                                OR: [
                                    { AND: [{ endDate: { gte: checkInDate } }, { endDate: { lte: checkOutDate } }] },
                                    {
                                        AND: [
                                            { startDate: { gte: checkInDate } },
                                            { startDate: { lte: checkOutDate } },
                                        ],
                                    },
                                ],
                            },
                            select: { id: true, endDate: true, startDate: true, stock: true },
                        },
                    },
                },
                priceOverrides: !isEmpty(allReservationDates)
                    ? {
                          where: {
                              OR: [
                                  {
                                      AND: [
                                          { endDate: { gte: checkOutDate } },
                                          { startDate: { lte: allReservationDates[0] } },
                                      ],
                                  },
                                  {
                                      AND: [
                                          { endDate: { gte: allReservationDates[0] } },
                                          { endDate: { lte: checkOutDate } },
                                      ],
                                  },
                                  {
                                      AND: [
                                          { startDate: { gte: allReservationDates[0] } },
                                          { startDate: { lte: checkOutDate } },
                                      ],
                                  },
                              ],
                          },
                          select: { id: true, endDate: true, priceScheme: true, startDate: true },
                          orderBy: { startDate: "desc" },
                      }
                    : undefined,
                priceSettings: !isEmpty(allReservationDates)
                    ? {
                          where: { dayOfWeek: { in: allReservationDates.map((d) => d.getDay()) } },
                          select: { id: true, dayOfWeek: true, priceScheme: true },
                      }
                    : undefined,
            },
        });
        if (!plan) throw new GqlError({ code: "NOT_FOUND", message: "Plan not found" });

        Log("reserveHotelRoom:", "packagePlan:", plan);

        const { hotelRoom, packagePlan, priceOverrides, priceSettings } = plan;

        if (hotelRoom.hotel.status !== "PUBLISHED")
            throw new GqlError({ code: "NOT_FOUND", message: "Hotel not found" });

        if (packagePlan.paymentTerm === "PER_PERSON" && !nAdult && !nChild) {
            throw new GqlError({
                code: "BAD_USER_INPUT",
                message: "Missing number of adults or number of child",
            });
        }

        let selectedOptions = [];
        if (!isEmpty(additionalOptions) && !isEmpty(packagePlan.additionalOptions)) {
            differenceWith(
                additionalOptions,
                packagePlan.additionalOptions,
                ({ optionId }, { id }) => optionId === id
            ).forEach(({ optionId }) => {
                throw new GqlError({
                    code: "BAD_USER_INPUT",
                    message: `Option with id ${optionId} not found in the plan.`,
                });
            });
            selectedOptions = packagePlan.additionalOptions.map((aOpts) => {
                const bOpt = additionalOptions.find(({ optionId }) => optionId === aOpts.id);
                if ((aOpts.paymentTerm === "PER_PERSON" || aOpts.paymentTerm === "PER_USE") && !bOpt.quantity) {
                    throw new GqlError({ code: "BAD_USER_INPUT", message: "Missing option quantity" });
                }
                return { ...aOpts, quantity: bOpt.quantity };
            });
        }

        const planTotalStocks = packagePlan.stock;
        const roomTotalStocks = hotelRoom.stock;

        if (hotelRoom.reservations.length >= roomTotalStocks) {
            throw new GqlError({
                code: "BAD_USER_INPUT",
                message: "Reservation is not available for this hotel room in the selected time frame",
            });
        }

        if (packagePlan.reservations.length >= planTotalStocks) {
            throw new GqlError({
                code: "BAD_USER_INPUT",
                message: "This plan has already out of stock.",
            });
        }

        const paymentMethod = await stripe.retrievePaymentMethod(paymentSourceId);
        if (paymentMethod.customer !== user.stripeCustomerId)
            throw new GqlError({ code: "NOT_FOUND", message: "Invalid payment source." });

        let appliedRoomPlanPriceOverrides = [];
        let appliedRoomPlanPriceSettings = [];
        let amount = 0;
        let remDates = allReservationDates;

        // Calculating override price
        if (!isEmpty(remDates) && !isEmpty(priceOverrides)) {
            let bookingDates = remDates;
            priceOverrides.forEach(({ id, endDate, priceScheme, startDate }) => {
                const matchedDates = intersectionWith(bookingDates, getAllDatesBetn(startDate, endDate), isEqualDate);
                const mDatesLen = matchedDates.length;
                if (mDatesLen > 0) {
                    if (packagePlan.paymentTerm === "PER_ROOM") {
                        amount += priceScheme.roomCharge * mDatesLen;
                    } else {
                        if (nAdult) {
                            const charge = priceScheme[mapNumAdultField(nAdult)] || priceScheme.oneAdultCharge;
                            amount += charge * nAdult * mDatesLen;
                        }
                        if (nChild) {
                            const charge = priceScheme[mapNumChildField(nChild)] || priceScheme.oneChildCharge;
                            amount += charge * nChild * mDatesLen;
                        }
                    }
                    bookingDates = differenceWith(bookingDates, matchedDates, isEqualDate);
                    appliedRoomPlanPriceOverrides.push(id);
                }
            });
            remDates = bookingDates;
        }
        if (!isEmpty(remDates)) {
            const remWeekDays = remDates.map((d) => d.getDay());
            const remPriceSettings = priceSettings.filter(({ dayOfWeek }) => remWeekDays.includes(dayOfWeek));
            if (packagePlan.paymentTerm === "PER_ROOM") {
                amount = sum(remPriceSettings.map(({ priceScheme }) => priceScheme.roomCharge));
            } else {
                let adultPrice = 0;
                let childPrice = 0;
                if (nAdult) {
                    let numAdultField = mapNumAdultField(nAdult);
                    adultPrice = sum(
                        remPriceSettings.map(
                            ({ priceScheme }) => (priceScheme[numAdultField] || priceScheme.oneAdultCharge) * nAdult
                        )
                    );
                }
                if (nChild) {
                    let numChildField = mapNumChildField(nChild);
                    childPrice = sum(
                        remPriceSettings.map(
                            ({ priceScheme }) => (priceScheme[numChildField] || priceScheme.oneChildCharge) * nChild
                        )
                    );
                }
                amount = adultPrice + childPrice;
            }
            appliedRoomPlanPriceSettings = appliedRoomPlanPriceSettings.concat(remPriceSettings.map(({ id }) => id));
        }

        // Calculating option price
        selectedOptions.forEach(({ paymentTerm, quantity, additionalPrice }) => {
            if (additionalPrice && additionalPrice > 0) {
                if (paymentTerm === "PER_PERSON" || paymentTerm === "PER_USE") amount += quantity * additionalPrice;
                else amount += additionalPrice;
            }
        });

        Log("applied plan", appliedRoomPlanPriceOverrides, appliedRoomPlanPriceSettings);

        // Calculating subscription price
        let subscriptionPrice =
            subscriptionUnit && subscriptionUnit > 0 ? packagePlan.subcriptionPrice * subscriptionUnit : undefined;

        Log("applied subscription", subscriptionUnit, subscriptionPrice);
        Log("applied amount", amount);

        const reservationId = "PS" + Math.floor(100000 + Math.random() * 900000);

        await Promise.all([
            addEmailToQueue<ReservationReceivedData>({
                template: "reservation-received",
                recipientEmail: email,
                recipientName: "",
                spaceId: hotelRoom.id,
                reservationId,
            }),
            addEmailToQueue<ReservationReceivedData>({
                template: "reservation-received",
                recipientEmail: hotelRoom.hotel.account.email,
                recipientName: "",
                spaceId: hotelRoom.id,
                reservationId,
            }),
        ]);

        const transaction = await store.transaction.create({
            data: {
                amount,
                provider: "STRIPE",
                assetType: "HOTEL_ROOM",
                assetData: omit(hotelRoom, "createdAt", "hotel", "reservations", "stockOverrides", "updatedAt"),
                currency: "JPY",
                description: `Reservation of ${hotelRoom.name}`,
                status: "CREATED",
                brand: paymentMethod.card.brand,
                lastAuthorizedDate: new Date(),
                account: { connect: { id: accountId } },
                hotelRoomReservation: {
                    create: {
                        approved: false,
                        fromDateTime: checkInDate,
                        toDateTime: checkOutDate,
                        status: "PENDING",
                        hotelRoom: { connect: { id: hotelRoom.id } },
                        packagePlan: { connect: { id: packagePlan.id } },
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
                    hotelRoomId: hotelRoom.id,
                },
                statement_descriptor: `AUTH_${environment.APP_READABLE_NAME}`.substring(0, 22),
                application_fee_amount: applicationFeeAmount,
                transfer_data: { destination: hotelRoom.hotel.account.host.stripeAccountId },
                confirm: true,
            };

            paymentIntent = await stripe.createPaymentIntent(paymentIntentParams);

            if (!paymentIntent.id) {
                await store.transaction.update({
                    where: { id: transaction.id },
                    data: {
                        requestedLog: paymentIntentParams as any,
                        failedLog: paymentIntent as any,
                        hotelRoomReservation: { update: { status: "FAILED" } },
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
        await Promise.all([
            addEmailToQueue<ReservationPendingData>({
                template: "reservation-pending",
                recipientEmail: email,
                recipientName: "",
                spaceId: hotelRoom.id,
                reservationId,
            }),
            addEmailToQueue<ReservationPendingData>({
                template: "reservation-pending",
                recipientEmail: hotelRoom.hotel.account.email,
                recipientName: "",
                spaceId: hotelRoom.id,
                reservationId,
            }),
        ]);

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
        await addEmailToQueue<ReservationFailedData>({
            template: "reservation-failed",
            recipientEmail: email,
            recipientName: "",
            spaceId: roomPlanId,
        });
        throw error;
    }
};

export const reserveHotelRoomTypeDefs = gql`
    input SelectedAdditionalOption {
        optionId: ID!
        quantity: Int
    }

    input ReserveHotelRoomInput {
        paymentSourceId: ID!
        roomPlanId: ID!
        checkInDate: Date!
        checkOutDate: Date!
        nAdult: Int
        nChild: Int
        additionalOptions: [SelectedAdditionalOption]
        useSubscription: Boolean
    }

    type ReserveHotelRoomResult {
        amount: Float
        currency: String
        description: String
        intentCode: String
        intentId: ID
        paymentMethodTypes: [String]
        reservationId: String
        subscriptionPrice: Int
        subscriptionUnit: Int
        transactionId: ID
    }

    type Mutation {
        reserveHotelRoom(input: ReserveHotelRoomInput!): ReserveHotelRoomResult @auth(requires: [user, host])
    }
`;

export const reserveHotelRoomResolvers = {
    Mutation: { reserveHotelRoom },
};
