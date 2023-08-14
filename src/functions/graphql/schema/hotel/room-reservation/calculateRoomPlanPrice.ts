import { IFieldResolver } from "@graphql-tools/utils";
import { Log } from "@utils/logger";
import { gql } from "apollo-server-core";
import { Context } from "../../../context";
import { GqlError } from "../../../error";
import { getAllDatesBetn } from "@utils/date-utils";
import { differenceWith, intersectionWith, isEmpty, sum } from "lodash";
import { mapNumAdultField, mapNumChildField } from "../price-scheme";
import moment from "moment";

function isEqualDate(a: Date, b: Date) {
    return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function validateCalculateRoomPlanInput(input: CalculateRoomPlanInput): CalculateRoomPlanInput {
    let { checkInDate, checkOutDate, additionalOptions, ...others } = input;

    if (checkOutDate < checkInDate) throw new GqlError({ code: "BAD_USER_INPUT", message: "無効な日付の選択" });

    if (checkInDate < moment().subtract(1, "days").toDate())
        throw new GqlError({ code: "BAD_USER_INPUT", message: "無効な日付の選択" });

    checkOutDate = moment(checkOutDate).subtract(1, "days").endOf("day").toDate();

    additionalOptions?.forEach(({ quantity }) => {
        if (quantity && quantity < 0) throw new GqlError({ code: "BAD_USER_INPUT", message: "無効なオプション数量" });
    });

    return { checkInDate, checkOutDate, additionalOptions, ...others };
}

type SelectedAdditionalOption = {
    optionId: string;
    quantity: number;
};

type CalculateRoomPlanInput = {
    roomPlanId: string;
    checkInDate: Date;
    checkOutDate: Date;
    nAdult?: number;
    nChild?: number;
    additionalOptions?: SelectedAdditionalOption[];
};

type CalculateRoomPlanArgs = { input: CalculateRoomPlanInput };

type CalculateRoomPlanResult = {
    appliedRoomPlanPriceSettings: string[];
    appliedRoomPlanPriceOverrides: string[];
    optionAmount: number;
    planAmount: number;
    totalAmount: number;
};

type CalculateRoomPlan = IFieldResolver<any, Context, CalculateRoomPlanArgs, Promise<CalculateRoomPlanResult>>;

const calculateRoomPlanPrice: CalculateRoomPlan = async (_, { input }, { authData, store }) => {
    const validInput = validateCalculateRoomPlanInput(input);
    const { checkInDate, checkOutDate, roomPlanId, additionalOptions, nAdult, nChild } = validInput;

    const allDates = getAllDatesBetn(checkInDate, checkOutDate);
    const weekDays = allDates.map((d) => d.getDay());

    Log(validInput);

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
                                { AND: [{ toDateTime: { gte: checkInDate } }, { toDateTime: { lte: checkOutDate } }] },
                            ],
                        },
                        select: { id: true },
                    },
                    stock: true,
                    subcriptionPrice: true,
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
                        { AND: [{ endDate: { gte: checkOutDate } }, { startDate: { lte: checkInDate } }] },
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
    if (!plan) throw new GqlError({ code: "NOT_FOUND", message: "プランが見つかりません" });

    Log("calculateRoomPlanPrice:", "packagePlan:", plan);

    const { hotelRoom, packagePlan, priceOverrides, priceSettings } = plan;

    if (packagePlan.paymentTerm === "PER_PERSON" && !nAdult && !nChild) {
        throw new GqlError({
            code: "BAD_USER_INPUT",
            message: "大人の人数または子供の人数が不足しています",
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
                message: `オプションが見つかりません`,
            });
        });
        selectedOptions = packagePlan.additionalOptions.map((aOpts) => {
            const bOpt = additionalOptions.find(({ optionId }) => optionId === aOpts.id);
            if ((aOpts.paymentTerm === "PER_PERSON" || aOpts.paymentTerm === "PER_USE") && !bOpt.quantity) {
                throw new GqlError({ code: "BAD_USER_INPUT", message: "オプションの数量が不足しています" });
            }
            return { ...aOpts, quantity: bOpt.quantity };
        });
    }

    const planTotalStocks = packagePlan.stock;
    const roomTotalStocks = hotelRoom.stock;

    if (hotelRoom.reservations.length >= roomTotalStocks) {
        throw new GqlError({
            code: "BAD_USER_INPUT",
            message: "選択された時間枠では、この施設は予約できません",
        });
    }

    if (packagePlan.reservations.length >= planTotalStocks) {
        throw new GqlError({
            code: "BAD_USER_INPUT",
            message: "このプランは在庫切れです。",
        });
    }

    let appliedRoomPlanPriceOverrides = [];
    let appliedRoomPlanPriceSettings = [];
    let planAmount = 0;
    let remDates = allDates;

    // Calculating override price
    if (!isEmpty(priceOverrides)) {
        let bookingDates = remDates;
        priceOverrides.forEach(({ id, endDate, priceScheme, startDate }) => {
            const matchedDates = intersectionWith(bookingDates, getAllDatesBetn(startDate, endDate), isEqualDate);
            const mDatesLen = matchedDates.length;
            if (mDatesLen > 0) {
                if (packagePlan.paymentTerm === "PER_ROOM") {
                    planAmount += priceScheme.roomCharge * mDatesLen;
                } else {
                    if (nAdult) {
                        const charge = priceScheme[mapNumAdultField(nAdult)] || priceScheme.oneAdultCharge;
                        planAmount += charge * nAdult * mDatesLen;
                    }
                    if (nChild) {
                        const charge = priceScheme[mapNumChildField(nChild)] || priceScheme.oneChildCharge;
                        planAmount += charge * nChild * mDatesLen;
                    }
                }
                bookingDates = differenceWith(bookingDates, matchedDates, isEqualDate);
                appliedRoomPlanPriceOverrides.push(id);
            }
        });
        remDates = bookingDates;
    }
    if (remDates.length > 0) {
        const remWeekDays = remDates.map((d) => d.getDay());
        const remPriceSettings = priceSettings.filter(({ dayOfWeek }) => remWeekDays.includes(dayOfWeek));
        if (packagePlan.paymentTerm === "PER_ROOM") {
            planAmount = sum(remPriceSettings.map(({ priceScheme }) => priceScheme.roomCharge));
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
            planAmount = adultPrice + childPrice;
        }
        appliedRoomPlanPriceSettings = appliedRoomPlanPriceSettings.concat(remPriceSettings.map(({ id }) => id));
    }

    let optionAmount = 0;
    // Calculating option price
    selectedOptions.forEach(({ paymentTerm, quantity, additionalPrice }) => {
        if (additionalPrice && additionalPrice > 0) {
            if (paymentTerm === "PER_PERSON" || paymentTerm === "PER_USE") optionAmount += quantity * additionalPrice;
            else optionAmount += additionalPrice;
        }
    });

    Log(remDates, appliedRoomPlanPriceOverrides, appliedRoomPlanPriceSettings, planAmount, optionAmount);

    return {
        appliedRoomPlanPriceOverrides,
        appliedRoomPlanPriceSettings,
        optionAmount,
        planAmount,
        totalAmount: planAmount + optionAmount,
    };
};

export const calculateRoomPlanPriceTypeDefs = gql`
    input SelectedAdditionalOption {
        optionId: ID!
        quantity: Int
    }

    input CalculateRoomPlanInput {
        roomPlanId: ID!
        checkInDate: Date!
        checkOutDate: Date!
        nAdult: Int
        nChild: Int
        additionalOptions: [SelectedAdditionalOption]
    }

    type CalculateRoomPlanResult {
        appliedRoomPlanPriceSettings: [ID]
        appliedRoomPlanPriceOverrides: [ID]
        optionAmount: Int
        planAmount: Int
        totalAmount: Int
    }

    type Query {
        calculateRoomPlanPrice(input: CalculateRoomPlanInput!): CalculateRoomPlanResult
    }
`;

export const calculateRoomPlanPriceResolvers = {
    Query: { calculateRoomPlanPrice },
};
