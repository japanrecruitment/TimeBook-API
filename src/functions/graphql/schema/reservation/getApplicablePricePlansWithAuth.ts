import { IFieldResolver } from "@graphql-tools/utils";
import { StripeLib } from "@libs/paymentProvider";
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

type GetApplicablePricePlansWithAuthResult = {
    spaceAmount: number;
    optionAmount: number;
    total: number;
    duration: number;
    durationType: SpacePricePlanType;
    applicablePricePlans: Partial<ApplicablePricePlan>[];
    subscriptionUnit: number;
    subscriptionAmount: number;
};

type GetApplicablePricePlansWithAuthInput = {
    duration: number;
    durationType: SpacePricePlanType;
    fromDateTime: Date;
    spaceId: string;
    additionalOptions?: SelectedAdditionalOption[];
    useSubscription?: boolean;
};

type GetApplicablePricePlansWithAuthArgs = { input: GetApplicablePricePlansWithAuthInput };

type GetApplicablePricePlansWithAuth = IFieldResolver<
    any,
    Context,
    GetApplicablePricePlansWithAuthArgs,
    Promise<GetApplicablePricePlansWithAuthResult>
>;

const getApplicablePricePlansWithAuth: GetApplicablePricePlansWithAuth = async (_, { input }, { authData, store }) => {
    const { id: userId, accountId, email } = authData;
    if (!accountId || !email || !userId) throw new GqlError({ code: "FORBIDDEN", message: "無効なリクエスト" });

    const { duration, durationType, fromDateTime, spaceId, additionalOptions, useSubscription } = input;

    const utcFromDateTime = moment.tz(fromDateTime, "Asia/Tokyo");

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

    const { days, hours, minutes } = getDurationsBetn(_fromDateTime.toDate(), _toDateTime.toDate());

    Log("reserveSpace: durations:", days, hours, minutes);

    if (days <= 0 && hours <= 0 && minutes < 5)
        throw new GqlError({ code: "BAD_USER_INPUT", message: "無効な日付の選択" });

    if (useSubscription) {
        const user = await store.user.findUnique({ where: { id: userId }, select: { stripeCustomerId: true } });
        if (!user) throw new GqlError({ code: "BAD_REQUEST", message: "ユーザーが見つかりません" });
        if (!user.stripeCustomerId)
            throw new GqlError({ code: "BAD_REQUEST", message: "ストライプアカウントが見つかりません" });
    }

    const space = await store.space.findUnique({
        where: { id: spaceId },
        select: {
            id: true,
            additionalOptions: additionalOptions
                ? { where: { id: { in: additionalOptions.map(({ optionId }) => optionId) } } }
                : undefined,
            subcriptionPrice: true,
        },
    });

    if (!space) throw new GqlError({ code: "NOT_FOUND", message: "スペースが見つかりません" });

    let remSubscriptionUnit: number = undefined;
    if (useSubscription) {
        const stripe = new StripeLib();
        const stripeSubs = await stripe.listSubscriptions(accountId, "rental-space");
        if (stripeSubs.length > 1) {
            throw new GqlError({
                code: "FORBIDDEN",
                message:
                    "アカウント内でスペース タイプの複数のサブスクリプションが見つかりました。 弊社のサポートチームにお問い合わせください",
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
            remSubscriptionUnit = usedUnit > totalUnit ? 0 : totalUnit - usedUnit;
        }
    }

    const totalReservationHours = (_toDateTime.toDate().getTime() - _fromDateTime.toDate().getTime()) / 3600000;
    const subscriptionUnit = remSubscriptionUnit
        ? remSubscriptionUnit < Math.ceil(totalReservationHours)
            ? remSubscriptionUnit
            : Math.ceil(totalReservationHours)
        : undefined;
    // Calculating subscription price
    let subscriptionPrice =
        subscriptionUnit && subscriptionUnit > 0 ? space.subcriptionPrice * subscriptionUnit : undefined;
    Log("applied subscription", totalReservationHours, remSubscriptionUnit, subscriptionUnit, subscriptionPrice);

    let applicablePricePlans = [];
    let amount = 0;

    const hasRemDates = totalReservationHours - (subscriptionUnit || 0) > 0;
    if (hasRemDates) {
        const newFromDateTime = _fromDateTime.clone().add(subscriptionUnit, "hours").toDate();
        const pricePlans = await store.spacePricePlan.findMany({
            where: {
                spaceId,
                isDeleted: false,
                type: durationType,
                duration: { lte: duration },
                OR: [
                    { isDefault: true },
                    {
                        AND: [{ fromDate: { gte: newFromDateTime } }, { fromDate: { lte: _toDateTime.toDate() } }],
                    },
                    {
                        AND: [{ toDate: { gte: newFromDateTime } }, { toDate: { lte: _toDateTime.toDate() } }],
                    },
                ],
            },
            include: { overrides: true },
        });

        // price plans may be deleted so need to filter it
        const filteredPricePlans = pricePlans.map((plan) => {
            if (!plan.isDeleted) {
                const filteredOverrides = plan.overrides.filter((override) => !override.isDeleted);
                return { ...plan, overrides: filteredOverrides };
            }
        });

        if (!pricePlans || pricePlans.length <= 0)
            throw new GqlError({
                code: "BAD_USER_INPUT",
                message: "選択した時間枠は、このスペースを予約するために必要な最小期間を満たしていません。",
            });

        // Calculate reservation price
        const { appliedReservationPlans, price } = new ReservationPriceCalculator({
            checkIn: newFromDateTime,
            checkOut: _toDateTime.toDate(),
            pricePlans: filteredPricePlans,
        });
        applicablePricePlans = appliedReservationPlans;
        amount = price;
    }

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
                throw new GqlError({ code: "BAD_USER_INPUT", message: "オプション数量がありません" });
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
        spaceAmount: amount,
        optionAmount: optionPrice,
        total: amount + optionPrice,
        applicablePricePlans,
        subscriptionAmount: subscriptionPrice,
        subscriptionUnit,
    };
};

export const getApplicablePricePlansWithAuthTypeDefs = gql`
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

    type GetApplicablePricePlansWithAuthResult {
        spaceAmount: Float
        optionAmount: Float
        total: Float
        duration: Int
        durationType: SpacePricePlanType
        applicablePricePlans: [ApplicablePricePlan]
        subscriptionUnit: Int
        subscriptionAmount: Int
    }

    input GetApplicablePricePlansWithAuthInput {
        duration: Int!
        durationType: SpacePricePlanType!
        fromDateTime: Date!
        spaceId: ID!
        additionalOptions: [SelectedAdditionalOption]
        useSubscription: Boolean
    }

    type Query {
        getApplicablePricePlansWithAuth(
            input: GetApplicablePricePlansWithAuthInput
        ): GetApplicablePricePlansWithAuthResult @auth(requires: [user, host])
    }
`;

export const getApplicablePricePlansWithAuthResolvers = { Query: { getApplicablePricePlansWithAuth } };
