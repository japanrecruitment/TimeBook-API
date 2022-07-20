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
import { Context } from "../../../context";
import { GqlError } from "../../../error";
import { getAllDatesBetn, getDurationsBetn } from "@utils/date-utils";
import { SpacePricePlanType } from "@prisma/client";
import moment from "moment";
import { environment } from "@utils/environment";
import { compact, differenceWith, intersectionWith, isEmpty, sum } from "lodash";
import { mapNumAdultField } from "../price-scheme";

function isEqualDate(a: Date, b: Date) {
    return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function validateReserveHotelRoomInput(input: ReserveHotelRoomInput): ReserveHotelRoomInput {
    let { checkInDate, checkOutDate, ...others } = input;

    checkInDate = new Date(checkInDate.getFullYear(), checkInDate.getMonth(), checkInDate.getDate());
    checkOutDate = new Date(checkOutDate.getFullYear(), checkOutDate.getMonth(), checkOutDate.getDate());

    if (checkOutDate < checkInDate) throw new GqlError({ code: "BAD_USER_INPUT", message: "Invalid date selections" });

    if (checkInDate < new Date()) throw new GqlError({ code: "BAD_USER_INPUT", message: "Invalid date selections" });

    return { checkInDate, checkOutDate, ...others };
}

type ReserveHotelRoomInput = {
    roomPlanId: string;
    paymentSourceId: string;
    checkInDate: Date;
    checkOutDate: Date;
    nAdult?: number;
    nChild?: number;
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
    transactionId: string;
};

type ReserveHotelRoom = IFieldResolver<any, Context, ReserveHotelRoomArgs, Promise<ReserveHotelRoomResult>>;

const reserveHotelRoom: ReserveHotelRoom = async (_, { input }, { authData, store }) => {
    const { accountId, email, id: userId } = authData;
    if (!accountId || !email || !userId) throw new GqlError({ code: "FORBIDDEN", message: "Invalid token!!" });

    const validInput = validateReserveHotelRoomInput(input);
    const { checkInDate, checkOutDate, paymentSourceId, roomPlanId, nAdult, nChild } = validInput;
    try {
        const allDates = getAllDatesBetn(checkInDate, checkOutDate);
        const weekDays = allDates.map((d) => d.getDay());

        const plan = await store.hotelRoom_PackagePlan.findUnique({
            where: { id: roomPlanId },
            select: {
                packagePlan: {
                    select: {
                        id: true,
                        paymentTerm: true,
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
                    },
                },
                hotelRoom: {
                    include: {
                        basicPriceSettings: {
                            where: { dayOfWeek: { in: weekDays } },
                            select: { id: true, priceScheme: true },
                        },
                        hotel: { select: { account: { select: { id: true, email: true, host: true } } } },
                        priceOverrides: {
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
                            select: { id: true, endDate: true, priceScheme: true, startDate: true },
                        },
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
                priceOverrides: {
                    where: {
                        OR: [
                            { AND: [{ endDate: { gte: checkInDate } }, { endDate: { lte: checkOutDate } }] },
                            { AND: [{ startDate: { gte: checkInDate } }, { startDate: { lte: checkOutDate } }] },
                        ],
                    },
                    select: { id: true, endDate: true, priceScheme: true, startDate: true },
                    orderBy: { startDate: "desc" },
                },
                priceSettings: {
                    where: { dayOfWeek: { in: weekDays } },
                    select: { id: true, dayOfWeek: true, priceScheme: true },
                },
            },
        });
        if (!plan) throw new GqlError({ code: "NOT_FOUND", message: "Plan not found" });
        if (accountId !== plan.hotelRoom?.hotel?.account?.id)
            throw new GqlError({ code: "FORBIDDEN", message: "You are not allowed to modify this hotel room" });

        Log("reserveHotelRoom:", "packagePlan:", plan);

        const { hotelRoom, packagePlan, priceOverrides, priceSettings } = plan;

        if (packagePlan.paymentTerm === "PER_PERSON" && !nAdult && !nChild) {
            throw new GqlError({
                code: "BAD_USER_INPUT",
                message: "Missing number of adults or number of child",
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

        const stripe = new StripeLib();
        const paymentMethod = await stripe.retrievePaymentMethod(paymentSourceId);
        const customerId = (await store.user.findUnique({ where: { id: userId }, select: { stripeCustomerId: true } }))
            ?.stripeCustomerId;
        if (paymentMethod.customer !== customerId)
            throw new GqlError({ code: "NOT_FOUND", message: "Invalid payment source." });

        let amount = 0;
        let remDates = allDates;

        // Calculating override price
        if (!isEmpty(priceOverrides)) {
            let bookingDates = remDates;
            priceOverrides.forEach(({ endDate, priceScheme, startDate }) => {
                const matchedDates = intersectionWith(bookingDates, getAllDatesBetn(startDate, endDate), isEqualDate);
                const mDatesLen = matchedDates.length;
                if (mDatesLen > 0) {
                    if (packagePlan.paymentTerm === "PER_ROOM") {
                        amount += priceScheme.roomCharge * mDatesLen;
                    } else {
                        if (nAdult)
                            amount += priceScheme[mapNumAdultField(nAdult) ?? "oneAdultCharge"] * nAdult * mDatesLen;
                        if (nChild)
                            amount += priceScheme[mapNumAdultField(nChild) ?? "oneChildCharge"] * nChild * mDatesLen;
                    }
                    bookingDates = differenceWith(bookingDates, matchedDates, isEqualDate);
                }
            });
            if (bookingDates.length > 0) remDates = bookingDates;
        }
        if (remDates.length > 0) {
            const remWeekDays = remDates.map((d) => d.getDay());
            const remPriceSettings = priceSettings.filter(({ dayOfWeek }) => remWeekDays.includes(dayOfWeek));
            if (packagePlan.paymentTerm === "PER_ROOM") {
                amount = sum(remPriceSettings.map(({ priceScheme }) => priceScheme.roomCharge));
            } else {
                let adultPrice = 0;
                let childPrice = 0;
                if (nAdult) {
                    let numAdultField = mapNumAdultField(nAdult) ?? "oneAdultCharge";
                    adultPrice = sum(remPriceSettings.map(({ priceScheme }) => priceScheme[numAdultField] * nAdult));
                }
                if (nChild) {
                    let numChildField = mapNumAdultField(nChild) ?? "oneChildCharge";
                    childPrice = sum(remPriceSettings.map(({ priceScheme }) => priceScheme[numChildField] * nChild));
                }
                amount = adultPrice + childPrice;
            }
        }
        const applicationFeeAmount = parseInt((amount * (appConfig.platformFeePercent / 100)).toString());
        const transferAmount = amount - applicationFeeAmount;

        const reservationId = "PS" + Math.floor(100000 + Math.random() * 900000);

        Log(amount, applicationFeeAmount, transferAmount);

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
                assetData: omit(
                    hotelRoom,
                    "basicPriceSettings",
                    "createdAt",
                    "hotel",
                    "priceOverrides",
                    "reservations",
                    "stockOverrides",
                    "updatedAt"
                ),
                currency: "JPY",
                description: `Reservation of ${hotelRoom.name}`,
                status: "CREATED",
                brand: paymentMethod.card.brand,
                lastAuthorizedDate: new Date(),
                account: { connect: { id: accountId } },
                hotelRoomReservation: {
                    create: {
                        approved: true,
                        fromDateTime: checkInDate,
                        toDateTime: checkOutDate,
                        status: "PENDING",
                        hotelRoom: { connect: { id: hotelRoom.id } },
                        packagePlan: { connect: { id: packagePlan.id } },
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

        const paymentIntent = await stripe.createPaymentIntent(paymentIntentParams);

        await store.transaction.update({
            where: { id: transaction.id },
            data: {
                paymentIntentId: paymentIntent.id,
                requestedLog: paymentIntentParams as any,
                responseReceivedLog: paymentIntent as any,
            },
        });

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
            spaceId: roomPlanId,
        });
        throw error;
    }
};

export const reserveHotelRoomTypeDefs = gql`
    input ReserveHotelRoomInput {
        paymentSourceId: ID!
        roomPlanId: ID!
        checkInDate: Date!
        checkOutDate: Date!
        nAdult: Int
        nChild: Int
    }

    type ReserveHotelRoomResult {
        amount: Float
        currency: String
        description: String
        intentCode: String
        intentId: ID
        paymentMethodTypes: [String]
        reservationId: String
        transactionId: ID
    }

    type Mutation {
        reserveHotelRoom(input: ReserveHotelRoomInput): ReserveHotelRoomResult @auth(requires: [user, host])
    }
`;

export const reserveHotelRoomResolvers = {
    Mutation: { reserveHotelRoom },
};
