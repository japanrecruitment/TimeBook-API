import { IFieldResolver } from "@graphql-tools/utils";
import { SpacePricePlanType } from "@prisma/client";
import { gql } from "apollo-server-core";
import moment from "moment";
import { Context } from "../../context";
import { GqlError } from "../../error";
import ReservationPriceCalculator from "./ReservationPriceCalculator";

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
    total: number;
    duration: number;
    durationType: SpacePricePlanType;
    applicablePricePlans: Partial<ApplicablePricePlan>[];
};

type GetApplicablePricePlansInput = {
    fromDateTime: Date;
    durationType: SpacePricePlanType;
    duration: number;
    spaceId: string;
};

type GetApplicablePricePlansArgs = { input: GetApplicablePricePlansInput };

type GetApplicablePricePlans = IFieldResolver<
    any,
    Context,
    GetApplicablePricePlansArgs,
    Promise<GetApplicablePricePlansResult>
>;

const getApplicablePricePlans: GetApplicablePricePlans = async (_, { input }, { store }) => {
    const { duration, durationType, fromDateTime, spaceId } = input;
    if (fromDateTime.getTime() < Date.now())
        throw new GqlError({ code: "BAD_USER_INPUT", message: "Invalid from date." });

    const durationUnit: Record<SpacePricePlanType, "days" | "hours" | "minutes"> = {
        DAILY: "days",
        HOURLY: "hours",
        MINUTES: "minutes",
    };

    const toDateTime = moment(fromDateTime).add(duration, durationUnit[durationType]).toDate();

    const pricePlans = await store.spacePricePlan.findMany({
        where: {
            AND: [
                { isDeleted: false, type: durationType, duration: { lte: duration }, spaceId },
                { OR: [{ isDefault: true }, { fromDate: { lte: toDateTime } }, { toDate: { lte: toDateTime } }] },
            ],
        },
        include: { overrides: true },
    });

    const { appliedReservationPlans, price } = new ReservationPriceCalculator({
        checkIn: fromDateTime,
        checkOut: toDateTime,
        pricePlans,
    });

    return {
        duration,
        durationType,
        total: price,
        applicablePricePlans: appliedReservationPlans,
    };
};

export const getApplicablePricePlansTypeDefs = gql`
    type ApplicablePricePlan {
        title: String
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
        total: Float
        duration: Int
        durationType: SpacePricePlanType
        applicablePricePlans: [ApplicablePricePlan]
    }

    input GetApplicablePricePlansInput {
        fromDateTime: Date!
        durationType: SpacePricePlanType!
        duration: Int!
        spaceId: ID!
    }

    type Query {
        getApplicablePricePlans(input: GetApplicablePricePlansInput): GetApplicablePricePlansResult
    }
`;

export const getApplicablePricePlansResolvers = { Query: { getApplicablePricePlans } };
