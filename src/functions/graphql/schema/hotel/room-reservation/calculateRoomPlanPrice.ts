import { IFieldResolver } from "@graphql-tools/utils";
import { Log } from "@utils/logger";
import { gql } from "apollo-server-core";
import { Context } from "../../../context";
import { GqlError } from "../../../error";
import { getAllDatesBetn } from "@utils/date-utils";
import { differenceWith, intersectionWith, isEmpty, sum } from "lodash";
import { mapNumAdultField } from "../price-scheme";
import moment from "moment";

function isEqualDate(a: Date, b: Date) {
    return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function validateCalculateRoomPlanInput(input: CalculateRoomPlanInput): CalculateRoomPlanInput {
    let { checkInDate, checkOutDate, ...others } = input;

    checkInDate = new Date(checkInDate.getFullYear(), checkInDate.getMonth(), checkInDate.getDate());
    checkOutDate = new Date(checkOutDate.getFullYear(), checkOutDate.getMonth(), checkOutDate.getDate());

    if (checkOutDate < checkInDate) throw new GqlError({ code: "BAD_USER_INPUT", message: "Invalid date selections" });

    if (checkInDate < new Date()) throw new GqlError({ code: "BAD_USER_INPUT", message: "Invalid date selections" });

    checkOutDate = moment(checkOutDate).subtract(1, "days").toDate();

    return { checkInDate, checkOutDate, ...others };
}

type CalculateRoomPlanInput = {
    roomPlanId: string;
    checkInDate: Date;
    checkOutDate: Date;
    nAdult?: number;
    nChild?: number;
};

type CalculateRoomPlanArgs = { input: CalculateRoomPlanInput };

type CalculateRoomPlanResult = {
    appliedRoomPlanPriceSettings: string[];
    appliedRoomPlanPriceOverrides: string[];
    totalAmount: number;
};

type CalculateRoomPlan = IFieldResolver<any, Context, CalculateRoomPlanArgs, Promise<CalculateRoomPlanResult>>;

const calculateRoomPlanPrice: CalculateRoomPlan = async (_, { input }, { authData, store }) => {
    const validInput = validateCalculateRoomPlanInput(input);
    const { checkInDate, checkOutDate, roomPlanId, nAdult, nChild } = validInput;

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
                                { AND: [{ toDateTime: { gte: checkInDate } }, { toDateTime: { lte: checkOutDate } }] },
                            ],
                        },
                        select: { id: true },
                    },
                    stock: true,
                },
            },
            hotelRoom: {
                include: {
                    hotel: { select: { account: { select: { id: true, email: true, host: true } } } },
                    reservations: {
                        where: {
                            OR: [
                                {
                                    AND: [
                                        { fromDateTime: { gte: checkInDate } },
                                        { fromDateTime: { lte: checkOutDate } },
                                    ],
                                },
                                { AND: [{ toDateTime: { gte: checkInDate } }, { toDateTime: { lte: checkOutDate } }] },
                            ],
                        },
                        select: { id: true },
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

    Log("calculateRoomPlanPrice:", "packagePlan:", plan);

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

    let appliedRoomPlanPriceOverrides = [];
    let appliedRoomPlanPriceSettings = [];
    let amount = 0;
    let remDates = allDates;

    // Calculating override price
    if (!isEmpty(priceOverrides)) {
        let bookingDates = remDates;
        priceOverrides.forEach(({ id, endDate, priceScheme, startDate }) => {
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
                appliedRoomPlanPriceOverrides.push(id);
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
        appliedRoomPlanPriceSettings = appliedRoomPlanPriceSettings.concat(remPriceSettings.map(({ id }) => id));
    }

    return {
        appliedRoomPlanPriceOverrides,
        appliedRoomPlanPriceSettings,
        totalAmount: amount,
    };
};

export const calculateRoomPlanPriceTypeDefs = gql`
    input CalculateRoomPlanInput {
        roomPlanId: ID!
        checkInDate: Date!
        checkOutDate: Date!
        nAdult: Int
        nChild: Int
    }

    type CalculateRoomPlanResult {
        appliedRoomPlanPriceSettings: [ID]
        appliedRoomPlanPriceOverrides: [ID]
        totalAmount: Int
    }

    type Query {
        calculateRoomPlanPrice(input: CalculateRoomPlanInput!): CalculateRoomPlanResult
    }
`;

export const calculateRoomPlanPriceResolvers = {
    Query: { calculateRoomPlanPrice },
};
