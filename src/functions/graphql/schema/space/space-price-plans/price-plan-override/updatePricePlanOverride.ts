import { PricePlanOverrideType } from "@prisma/client";
import { IFieldResolver } from "@graphql-tools/utils";
import { gql } from "apollo-server-core";
import { GqlError } from "src/functions/graphql/error";
import { Context } from "../../../../context";
import { Result } from "../../../core/result";
import { PricePlanOverrideObject } from "./PricePlanOverrideObject";
import { Log } from "@utils/logger";
import { getDaysOfWeekBetn } from "@utils/date-utils";
import { omit } from "@utils/object-helper";

type UpdatePricePlanOverrideInput = {
    id: string;
    amount: number;
    type: PricePlanOverrideType;
    daysOfWeek?: Array<number>;
    fromDate?: Date;
    toDate?: Date;
};

type UpdatePricePlanOverrideResult = {
    result: Result;
    pricePlanOverride: PricePlanOverrideObject;
};

type UpdatePricePlanOverrideArgs = {
    input: UpdatePricePlanOverrideInput;
};

type UpdatePricePlanOverride = IFieldResolver<
    any,
    Context,
    UpdatePricePlanOverrideArgs,
    Promise<UpdatePricePlanOverrideResult>
>;

const validateInput = (input: UpdatePricePlanOverrideInput) => {
    const { amount, type, daysOfWeek, fromDate, toDate } = input;

    if (type === "DAY_OF_WEEK") {
        if (!daysOfWeek || daysOfWeek.length <= 0)
            throw new GqlError({ code: "BAD_USER_INPUT", message: `Missing required field day of week` });

        daysOfWeek.forEach((d) => {
            if (d > 6 || d < 0) {
                throw new GqlError({ code: "BAD_USER_INPUT", message: `Invalid day of week ${d}` });
            }
        });
    } else if (type === "DATE_TIME") {
        if (!fromDate || !toDate)
            throw new GqlError({ code: "BAD_USER_INPUT", message: `Missing required fields from date and to date` });

        if (fromDate.getTime() < Date.now() || fromDate.getTime() > toDate.getTime())
            throw new GqlError({ code: "BAD_USER_INPUT", message: "Invalid start date" });

        if (toDate.getTime() < Date.now() || toDate.getTime() < fromDate.getTime())
            throw new GqlError({ code: "BAD_USER_INPUT", message: "Invalid end date" });
    }

    if (!amount || amount <= 0) throw new GqlError({ code: "BAD_USER_INPUT", message: "Invalid amount" });
};

const updatePricePlanOverride: UpdatePricePlanOverride = async (_, { input }, { authData, store }, info) => {
    validateInput(input);

    const { id, type, daysOfWeek, fromDate, toDate } = input;

    const { accountId } = authData;

    const pricePlanOverride = await store.pricePlanOverride.findUnique({
        where: { id },
        include: { pricePlan: { select: { fromDate: true, toDate: true, space: { select: { accountId: true } } } } },
    });

    Log("updatePricePlanOverride: ", pricePlanOverride);

    if (!pricePlanOverride) throw new GqlError({ code: "NOT_FOUND", message: "Price plan override not found" });

    if (accountId !== pricePlanOverride.pricePlan.space.accountId)
        throw new GqlError({ code: "FORBIDDEN", message: "You are not allowed to modify this price plan" });

    if (type === "DATE_TIME") {
        if (pricePlanOverride.pricePlan.fromDate || pricePlanOverride.pricePlan.toDate) {
            if (
                pricePlanOverride.pricePlan.fromDate &&
                (fromDate.getTime() < pricePlanOverride.pricePlan.fromDate.getTime() ||
                    (pricePlanOverride.pricePlan.toDate &&
                        fromDate.getTime() > pricePlanOverride.pricePlan.toDate.getTime()))
            ) {
                throw new GqlError({
                    code: "BAD_USER_INPUT",
                    message: `Start date cannot be less than or greater than that of the price plan`,
                });
            }
            if (
                pricePlanOverride.pricePlan.toDate &&
                (toDate.getTime() > pricePlanOverride.pricePlan.toDate.getTime() ||
                    (pricePlanOverride.pricePlan.fromDate &&
                        toDate.getTime() < pricePlanOverride.pricePlan.fromDate.getTime()))
            ) {
                throw new GqlError({
                    code: "BAD_USER_INPUT",
                    message: `End date cannot be less than or  greater than that of the price plan`,
                });
            }
        }
    }

    if (type === "DAY_OF_WEEK") {
        if (pricePlanOverride.pricePlan.fromDate && pricePlanOverride.pricePlan.toDate) {
            const days = getDaysOfWeekBetn(pricePlanOverride.pricePlan.fromDate, pricePlanOverride.pricePlan.toDate, {
                distinct: true,
            });
            daysOfWeek.forEach((d) => {
                if (!days.includes(d)) {
                    throw new GqlError({
                        code: "BAD_USER_INPUT",
                        message: `Cannot add override this price plan as with ${daysOfWeek} as it doesn't include some of them in it's duration`,
                    });
                }
            });
        }
    }

    const data = type === "DATE_TIME" ? omit(input, "id", "daysOfWeek") : omit(input, "id", "fromDate", "toDate");
    const updatedPricePlanOverride = await store.pricePlanOverride.update({ where: { id }, data });

    return {
        result: { message: `Successfully updated a override in price plan` },
        pricePlanOverride: updatedPricePlanOverride,
    };
};

export const updatePricePlanOverrideTypeDefs = gql`
    input UpdatePricePlanOverrideInput {
        id: ID!
        amount: Float
        type: PricePlanOverrideType
        daysOfWeek: [Int!]
        fromDate: Date
        toDate: Date
    }

    type UpdatePricePlanOverrideResult {
        result: Result
        pricePlanOverride: PricePlanOverrideObject
    }

    type Mutation {
        updatePricePlanOverride(input: UpdatePricePlanOverrideInput!): UpdatePricePlanOverrideResult!
            @auth(requires: [user, host])
    }
`;

export const updatePricePlanOverrideResolvers = {
    Mutation: { updatePricePlanOverride },
};
