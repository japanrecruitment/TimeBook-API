import { IFieldResolver } from "@graphql-tools/utils";
import { SpacePricePlanType } from "@prisma/client";
import { getDurationsBetn } from "@utils/date-utils";
import { Log } from "@utils/logger";
import { gql } from "apollo-server-core";
import { differenceWith, isEmpty } from "lodash";
import moment from "moment-timezone";
import { Context } from "../../context";
import { GqlError } from "../../error";
import ReservationPriceCalculator from "./ReservationPriceCalculator";
import { dateRangesOverlap } from "@utils/date-utils/dateRangesOverlap";
import { getDefaultSetting } from "@utils/space-settings-helper/getDefaultSetting";
import { checkSpaceSettings } from "@utils/space-settings-helper";

type SelectedAdditionalOption = {
    optionId: string;
    quantity: number;
};

type ApplicablePricePlan = {
    title: string;
    duration: number;
    type: SpacePricePlanType;
    isDefault: boolean;
    isOverride: boolean;
    fromDate: Date;
    toDate: Date;
    amount: number;
    appliedTimes: number;
};

type GetApplicablePricePlansResult = {
    spaceAmount: number;
    optionAmount: number;
    total: number;
    duration: number;
    durationType: SpacePricePlanType;
    applicablePricePlans: Partial<ApplicablePricePlan>[];
};

type GetApplicablePricePlansInput = {
    duration: number;
    durationType: SpacePricePlanType;
    fromDateTime: Date;
    spaceId: string;
    additionalOptions?: SelectedAdditionalOption[];
};

type GetApplicablePricePlansArgs = { input: GetApplicablePricePlansInput };

type GetApplicablePricePlans = IFieldResolver<
    any,
    Context,
    GetApplicablePricePlansArgs,
    Promise<GetApplicablePricePlansResult>
>;

const getApplicablePricePlans: GetApplicablePricePlans = async (_, { input }, { store }) => {
    const { duration, durationType, fromDateTime, spaceId, additionalOptions } = input;
    Log("Input Debug", { duration, durationType, fromDateTime, spaceId });
    Log(duration, "duration");
    Log(durationType, "durationType");
    const utcFromDateTime = moment.tz(fromDateTime, "Asia/Tokyo");

    Log("Date Conversion Debug", {
        originalInput: fromDateTime,
        utcFromDateTime: utcFromDateTime.toISOString(),
        timezone: utcFromDateTime.format("Z"),
    });

    if (utcFromDateTime.isBefore(moment().utc()))
        throw new GqlError({ code: "BAD_USER_INPUT", message: "無効な開始日" });

    if (duration <= 0) throw new GqlError({ code: "BAD_USER_INPUT", message: "無効な期間" });

    additionalOptions?.forEach(({ quantity }) => {
        if (quantity && quantity < 0) throw new GqlError({ code: "BAD_USER_INPUT", message: "無効なオプション数量" });
    });

    const durationUnit: Record<SpacePricePlanType, "days" | "hours" | "minutes"> = {
        DAILY: "days",
        HOURLY: "hours",
        MINUTES: "minutes",
    };

    let _fromDateTime: moment.Moment = utcFromDateTime.clone();
    let _toDateTime: moment.Moment | null = null;

    if (durationType === "DAILY") {
        _fromDateTime = utcFromDateTime.clone().startOf("day");

        if (duration === 1) {
            _toDateTime = _fromDateTime.clone().endOf("day");
        } else {
            _toDateTime = _fromDateTime
                .clone()
                .add(duration - 1, durationUnit[durationType])
                .endOf("day");
        }
    } else {
        _toDateTime = _fromDateTime.clone().add(duration, durationUnit[durationType]);
    }

    Log("Date Range Debug", {
        durationType,
        duration,
        _fromDateTime: _fromDateTime.toISOString(),
        _toDateTime: _toDateTime.toISOString(),
        calculatedDuration: {
            from: _fromDateTime.format("YYYY-MM-DD HH:mm:ss"),
            to: _toDateTime.format("YYYY-MM-DD HH:mm:ss"),
        },
    });

    const { days, hours, minutes } = getDurationsBetn(_fromDateTime.toDate(), _toDateTime.toDate());

    // Log("reserveSpace: durations:", days, hours, minutes);

    if (days <= 0 && hours <= 0 && minutes < 5)
        throw new GqlError({ code: "BAD_USER_INPUT", message: "無効な日付の選択" });

    const space = await store.space.findUnique({
        where: { id: spaceId },
        select: {
            pricePlans: {
                where: {
                    AND: [
                        {
                            isDeleted: false,
                            type: durationType,
                            duration: durationType === "DAILY" ? duration : { gte: duration },
                            spaceId,
                        },
                        {
                            OR: [
                                { isDefault: true },
                                { fromDate: { lte: _toDateTime.toDate() } },
                                { toDate: { gte: _fromDateTime.toDate() } },
                                { fromDate: null, toDate: null }, // Include plans without date restrictions
                            ],
                        },
                    ],
                },
                include: { overrides: true },
            },
            additionalOptions: additionalOptions
                ? { where: { id: { in: additionalOptions.map(({ optionId }) => optionId) } } }
                : undefined,
            settings: {
                where: {
                    OR: [
                        { isDefault: true },
                        { fromDate: { lte: _toDateTime.toDate() } },
                        { toDate: { lte: _toDateTime.toDate() } },
                    ],
                },
            },
        },
    });

    Log("Query Debug", {
        spaceId,
        duration,
        durationType,
        queryConditions: {
            isDeleted: false,
            type: durationType,
            duration: durationType === "DAILY" ? duration : { gte: duration },
            spaceId,
            dateRange: {
                from: _fromDateTime.toDate(),
                to: _toDateTime.toDate(),
            },
        },
    });
    Log("space", space);
    const requestDateRange = { from: _fromDateTime, to: _toDateTime };

    // Check if applicable settings have space closed on the date
    if (!checkSpaceSettings(space.settings, requestDateRange))
        throw new GqlError({
            code: "BAD_USER_INPUT",
            message: `選択された日付にはスペースが予約できません`,
        });

    const defaultSetting = getDefaultSetting(space.settings);

    // price plans may be deleted so need to filter it
    const filteredPricePlans = space.pricePlans.map((plan) => {
        if (!plan.isDeleted) {
            const filteredOverrides = plan.overrides.filter((override) => !override.isDeleted);
            return { ...plan, overrides: filteredOverrides };
        }
    });

    Log("Filtered Price Plans", {
        totalPlans: filteredPricePlans.length,
        plans: filteredPricePlans.map((p) => ({
            title: p.title,
            amount: p.amount,
            duration: p.duration,
            isDefault: p.isDefault,
            overrides: p.overrides?.map((o) => ({
                amount: o.amount,
                fromDate: o.fromDate,
                toDate: o.toDate,
            })),
        })),
    });

    const dailyPlan = filteredPricePlans.find((plan) => plan.type === "DAILY");
    const hasDailyPlan = !!dailyPlan;

    const { appliedReservationPlans, price } = new ReservationPriceCalculator({
        checkIn: hasDailyPlan ? _fromDateTime.toDate() : _fromDateTime.toDate(),
        checkOut: hasDailyPlan ? _toDateTime.toDate() : _toDateTime.toDate(),
        pricePlans: filteredPricePlans,
    });

    Log("ReservationPriceCalculator Input", {
        checkIn: _fromDateTime.toDate(),
        checkOut: _toDateTime.toDate(),
        filteredPricePlans: filteredPricePlans.map((p) => ({
            title: p.title,
            amount: p.amount,
            isDefault: p.isDefault,
            overrides: p.overrides?.map((o) => ({
                amount: o.amount,
                fromDate: o.fromDate,
                toDate: o.toDate,
                isDeleted: o.isDeleted,
            })),
        })),
    });

    let selectedOptions = [];
    if (!isEmpty(additionalOptions) && !isEmpty(space.additionalOptions)) {
        differenceWith(additionalOptions, space.additionalOptions, ({ optionId }, { id }) => optionId === id).forEach(
            ({ optionId }) => {
                throw new GqlError({
                    code: "BAD_USER_INPUT",
                    message: `オプションが見つかりません`,
                });
            },
        );
        selectedOptions = space.additionalOptions.map((aOpts) => {
            const bOpt = additionalOptions.find(({ optionId }) => optionId === aOpts.id);
            if ((aOpts.paymentTerm === "PER_PERSON" || aOpts.paymentTerm === "PER_USE") && !bOpt.quantity) {
                throw new GqlError({ code: "BAD_USER_INPUT", message: "オプション在庫数が必要です" });
            }
            return { ...aOpts, quantity: bOpt.quantity };
        });
    }

    let optionPrice = 0;
    // Calculating option price
    selectedOptions.forEach(({ paymentTerm, quantity, additionalPrice }) => {
        if (additionalPrice && additionalPrice > 0) {
            if (paymentTerm === "PER_PERSON" || paymentTerm === "PER_USE") optionPrice += quantity * additionalPrice;
            else optionPrice += additionalPrice;
        }
    });

    return {
        duration,
        durationType,
        spaceAmount: price,
        optionAmount: optionPrice,
        total: price + optionPrice,
        applicablePricePlans: appliedReservationPlans,
    };
};

export const getApplicablePricePlansTypeDefs = gql`
    input SelectedAdditionalOption {
        optionId: ID!
        quantity: Int
    }

    type ApplicablePricePlan {
        id: ID!
        title: String
        daysOfWeek: [Int]
        duration: Int
        type: SpacePricePlanType
        isDefault: Boolean
        isOverride: Boolean
        fromDate: Date
        toDate: Date
        amount: Float
        appliedTimes: Int
    }

    type GetApplicablePricePlansResult {
        spaceAmount: Float
        optionAmount: Float
        total: Float
        duration: Int
        durationType: SpacePricePlanType
        applicablePricePlans: [ApplicablePricePlan]
    }

    input GetApplicablePricePlansInput {
        duration: Int!
        durationType: SpacePricePlanType!
        fromDateTime: Date!
        spaceId: ID!
        additionalOptions: [SelectedAdditionalOption]
    }

    type Query {
        getApplicablePricePlans(input: GetApplicablePricePlansInput): GetApplicablePricePlansResult
    }
`;

export const getApplicablePricePlansResolvers = { Query: { getApplicablePricePlans } };
