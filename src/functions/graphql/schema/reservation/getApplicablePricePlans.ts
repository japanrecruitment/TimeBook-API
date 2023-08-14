import { IFieldResolver } from "@graphql-tools/utils";
import { SpacePricePlanType } from "@prisma/client";
import { getDurationsBetn } from "@utils/date-utils";
import { Log } from "@utils/logger";
import { gql } from "apollo-server-core";
import { differenceWith, isEmpty } from "lodash";
import moment from "moment";
import { Context } from "../../context";
import { GqlError } from "../../error";
import ReservationPriceCalculator from "./ReservationPriceCalculator";

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
    if (fromDateTime.getTime() < Date.now()) throw new GqlError({ code: "BAD_USER_INPUT", message: "無効な開始日" });

    if (duration <= 0) throw new GqlError({ code: "BAD_USER_INPUT", message: "無効な期間" });

    additionalOptions?.forEach(({ quantity }) => {
        if (quantity && quantity < 0) throw new GqlError({ code: "BAD_USER_INPUT", message: "無効なオプション数量" });
    });

    const durationUnit: Record<SpacePricePlanType, "days" | "hours" | "minutes"> = {
        DAILY: "days",
        HOURLY: "hours",
        MINUTES: "minutes",
    };

    const toDateTime = moment(fromDateTime).add(duration, durationUnit[durationType]).toDate();

    const { days, hours, minutes } = getDurationsBetn(fromDateTime, toDateTime);

    Log("reserveSpace: durations:", days, hours, minutes);

    if (days <= 0 && hours <= 0 && minutes < 5)
        throw new GqlError({ code: "BAD_USER_INPUT", message: "無効な日付の選択" });

    const space = await store.space.findUnique({
        where: { id: spaceId },
        select: {
            pricePlans: {
                where: {
                    AND: [
                        { isDeleted: false, type: durationType, duration: { lte: duration }, spaceId },
                        {
                            OR: [
                                { isDefault: true },
                                { fromDate: { lte: toDateTime } },
                                { toDate: { lte: toDateTime } },
                            ],
                        },
                    ],
                },
                include: { overrides: true },
            },
            additionalOptions: additionalOptions
                ? { where: { id: { in: additionalOptions.map(({ optionId }) => optionId) } } }
                : undefined,
        },
    });

    const { appliedReservationPlans, price } = new ReservationPriceCalculator({
        checkIn: fromDateTime,
        checkOut: toDateTime,
        pricePlans: space.pricePlans,
    });

    let selectedOptions = [];
    if (!isEmpty(additionalOptions) && !isEmpty(space.additionalOptions)) {
        differenceWith(additionalOptions, space.additionalOptions, ({ optionId }, { id }) => optionId === id).forEach(
            ({ optionId }) => {
                throw new GqlError({
                    code: "BAD_USER_INPUT",
                    message: `オプションが見つかりません`,
                });
            }
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
