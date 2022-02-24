import { PricePlanOverrideType } from "@prisma/client";
import { IFieldResolver } from "@graphql-tools/utils";
import { gql } from "apollo-server-core";
import { GqlError } from "src/functions/graphql/error";
import { Context } from "../../../../context";
import { Result } from "../../../core/result";
import { PricePlanOverrideObject } from "./PricePlanOverrideObject";
import { Log } from "@utils/logger";
import { getDaysOfWeekIncludedBetn } from "@utils/date-utils";
import { omit } from "@utils/object-helper";

type PricePlanOverrideInput = {
    amount: number;
    type: PricePlanOverrideType;
    daysOfWeek?: Array<number>;
    fromDate?: Date;
    toDate?: Date;
};

type AddPricePlanOverrideResult = {
    result: Result;
    pricePlanOverride: PricePlanOverrideObject;
};

type AddPricePlanOverrideArgs = {
    pricePlanId: string;
    input: PricePlanOverrideInput;
};

type AddPricePlanOverride = IFieldResolver<any, Context, AddPricePlanOverrideArgs, Promise<AddPricePlanOverrideResult>>;

const validateInput = (input: PricePlanOverrideInput) => {
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

const addPricePlanOverride: AddPricePlanOverride = async (_, { input, pricePlanId }, { authData, store }, info) => {
    validateInput(input);

    const { type, daysOfWeek, fromDate, toDate } = input;

    const { accountId } = authData;

    const pricePlan = await store.spacePricePlan.findFirst({
        where: { id: pricePlanId, isDeleted: false },
        select: {
            fromDate: true,
            toDate: true,
            overrides: {
                where:
                    type === "DAY_OF_WEEK"
                        ? { daysOfWeek: { hasSome: daysOfWeek } }
                        : {
                              OR: [
                                  { AND: [{ fromDate: { lte: fromDate } }, { toDate: { gte: toDate } }] },
                                  { AND: [{ fromDate: { gte: fromDate } }, { fromDate: { lte: toDate } }] },
                                  { AND: [{ toDate: { gte: fromDate } }, { toDate: { lte: toDate } }] },
                              ],
                          },
            },
            space: { select: { accountId: true } },
        },
    });

    Log("addPricePlanOverride: ", pricePlan);

    if (!pricePlan) throw new GqlError({ code: "NOT_FOUND", message: "Price plan not found" });

    if (accountId !== pricePlan.space.accountId)
        throw new GqlError({ code: "FORBIDDEN", message: "You are not allowed to modify this price plan" });

    if (type === "DATE_TIME") {
        if (pricePlan.fromDate || pricePlan.toDate) {
            if (
                pricePlan.fromDate &&
                (fromDate.getTime() < pricePlan.fromDate.getTime() ||
                    (pricePlan.toDate && fromDate.getTime() > pricePlan.toDate.getTime()))
            ) {
                throw new GqlError({
                    code: "BAD_USER_INPUT",
                    message: `Start date cannot be less than or greater than that of the price plan`,
                });
            }
            if (
                pricePlan.toDate &&
                (toDate.getTime() > pricePlan.toDate.getTime() ||
                    (pricePlan.fromDate && toDate.getTime() < pricePlan.fromDate.getTime()))
            ) {
                throw new GqlError({
                    code: "BAD_USER_INPUT",
                    message: `End date cannot be less than or  greater than that of the price plan`,
                });
            }
        }
    }

    if (type === "DAY_OF_WEEK") {
        if (pricePlan.fromDate && pricePlan.toDate) {
            const days = getDaysOfWeekIncludedBetn(pricePlan.fromDate, pricePlan.toDate);
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

    pricePlan.overrides.forEach(() => {
        throw new GqlError({
            code: "BAD_USER_INPUT",
            message: `This price plan already has a override that collide with provided time.`,
        });
    });

    const data = type === "DATE_TIME" ? omit(input, "daysOfWeek") : omit(input, "fromDate", "toDate");
    const pricePlanOverride = await store.pricePlanOverride.create({
        data: { ...data, pricePlan: { connect: { id: pricePlanId } } },
    });

    return {
        result: { message: `Successfully added new override in price plan` },
        pricePlanOverride,
    };
};

export const addPricePlanOverrideTypeDefs = gql`
    input PricePlanOverrideInput {
        amount: Float!
        type: PricePlanOverrideType!
        daysOfWeek: [Int!]
        fromDate: Date
        toDate: Date
    }

    type AddPricePlanOverrideResult {
        result: Result
        pricePlanOverride: PricePlanOverrideObject
    }

    type Mutation {
        addPricePlanOverride(pricePlanId: ID!, input: PricePlanOverrideInput): AddPricePlanOverrideResult!
            @auth(requires: [user, host])
    }
`;

export const addPricePlanOverrideResolvers = {
    Mutation: { addPricePlanOverride },
};
