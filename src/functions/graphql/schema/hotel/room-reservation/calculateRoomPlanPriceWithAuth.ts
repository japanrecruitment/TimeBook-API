import { IFieldResolver } from "@graphql-tools/utils";
import { Log } from "@utils/logger";
import { gql } from "apollo-server-core";
import { Context } from "../../../context";
import { GqlError } from "../../../error";
import { getAllDatesBetn } from "@utils/date-utils";
import { differenceWith, intersectionWith, isEmpty, sum } from "lodash";
import { mapNumAdultField, mapNumChildField } from "../price-scheme";
import moment from "moment";
import { StripeLib } from "@libs/paymentProvider";

function isEqualDate(a: Date, b: Date) {
    return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function validateCalculateRoomPlanPriceWithAuthInput(
    input: CalculateRoomPlanPriceWithAuthInput
): CalculateRoomPlanPriceWithAuthInput {
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

type CalculateRoomPlanPriceWithAuthInput = {
    roomPlanId: string;
    checkInDate: Date;
    checkOutDate: Date;
    nAdult?: number;
    nChild?: number;
    additionalOptions?: SelectedAdditionalOption[];
    useSubscription?: boolean;
};

type CalculateRoomPlanPriceWithAuthArgs = { input: CalculateRoomPlanPriceWithAuthInput };

type CalculateRoomPlanPriceWithAuthResult = {
    appliedRoomPlanPriceSettings: string[];
    appliedRoomPlanPriceOverrides: string[];
    optionAmount: number;
    planAmount: number;
    subscriptionUnit: number;
    subscriptionAmount: number;
    totalAmount: number;
};

type CalculateRoomPlanPriceWithAuth = IFieldResolver<
    any,
    Context,
    CalculateRoomPlanPriceWithAuthArgs,
    Promise<CalculateRoomPlanPriceWithAuthResult>
>;

const calculateRoomPlanPriceWithAuth: CalculateRoomPlanPriceWithAuth = async (_, { input }, { authData, store }) => {
    const { accountId, email, id: userId } = authData;
    if (!accountId || !email || !userId) throw new GqlError({ code: "FORBIDDEN", message: "無効なリクエスト" });

    const validInput = validateCalculateRoomPlanPriceWithAuthInput(input);
    Log(validInput);
    const { checkInDate, checkOutDate, roomPlanId, additionalOptions, nAdult, nChild, useSubscription } = validInput;

    let remSubscriptionUnit: number = undefined;
    if (useSubscription) {
        const user = await store.user.findUnique({ where: { id: userId }, select: { stripeCustomerId: true } });
        if (!user) throw new GqlError({ code: "BAD_REQUEST", message: "無効なリクエスト" });
        if (!user.stripeCustomerId)
            throw new GqlError({ code: "BAD_REQUEST", message: "ストライプアカウントが見つかりません。" });

        const stripe = new StripeLib();
        const stripeSubs = await stripe.listSubscriptions(accountId, "hotel");
        if (stripeSubs.length > 1) {
            throw new GqlError({
                code: "FORBIDDEN",
                message:
                    "アカウント内でスペースタイプの複数のサブスクリプションが見つかりました。 弊社のサポートチームにお問い合わせください",
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
            remSubscriptionUnit = usedUnit > totalUnit ? 0 : totalUnit - usedUnit;
        }
    }

    const allReservationDates = getAllDatesBetn(checkInDate, checkOutDate);

    const totalReservationUnits = allReservationDates.length;
    const subscriptionUnit = remSubscriptionUnit
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
    if (!plan) throw new GqlError({ code: "NOT_FOUND", message: "プランが見つかりません" });

    Log("calculateRoomPlanPriceWithAuth:", "packagePlan:", plan);

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
                message: `オプションが見つかりません。`,
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
    let remDates = allReservationDates;

    // Calculating override price
    if (!isEmpty(remDates) && !isEmpty(priceOverrides)) {
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
    if (!isEmpty(remDates)) {
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

    Log("applied plan", appliedRoomPlanPriceOverrides, appliedRoomPlanPriceSettings);

    // Calculating subscription price
    let subscriptionPrice =
        subscriptionUnit && subscriptionUnit > 0 ? packagePlan.subcriptionPrice * subscriptionUnit : undefined;

    Log("applied subscription", subscriptionUnit, subscriptionPrice);
    Log("applied plan amount", allReservationDates, planAmount);
    Log("applied option amount", selectedOptions, optionAmount);

    return {
        appliedRoomPlanPriceOverrides,
        appliedRoomPlanPriceSettings,
        optionAmount,
        planAmount,
        subscriptionUnit,
        subscriptionAmount: subscriptionPrice,
        totalAmount: planAmount + optionAmount,
    };
};

export const calculateRoomPlanPriceWithAuthTypeDefs = gql`
    input SelectedAdditionalOption {
        optionId: ID!
        quantity: Int
    }

    input CalculateRoomPlanPriceWithAuthInput {
        roomPlanId: ID!
        checkInDate: Date!
        checkOutDate: Date!
        nAdult: Int
        nChild: Int
        additionalOptions: [SelectedAdditionalOption]
        useSubscription: Boolean
    }

    type CalculateRoomPlanPriceWithAuthResult {
        appliedRoomPlanPriceSettings: [ID]
        appliedRoomPlanPriceOverrides: [ID]
        optionAmount: Int
        planAmount: Int
        subscriptionUnit: Int
        subscriptionAmount: Int
        totalAmount: Int
    }

    type Query {
        calculateRoomPlanPriceWithAuth(
            input: CalculateRoomPlanPriceWithAuthInput!
        ): CalculateRoomPlanPriceWithAuthResult @auth(requires: [user, host])
    }
`;

export const calculateRoomPlanPriceWithAuthResolvers = {
    Query: { calculateRoomPlanPriceWithAuth },
};
