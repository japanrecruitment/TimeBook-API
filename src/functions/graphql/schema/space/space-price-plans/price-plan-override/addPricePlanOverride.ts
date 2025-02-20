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
            throw new GqlError({ code: "BAD_USER_INPUT", message: `曜日がありません` });

        daysOfWeek.forEach((d) => {
            if (d > 6 || d < 0) {
                throw new GqlError({ code: "BAD_USER_INPUT", message: `無効な曜日` });
            }
        });
    } else if (type === "DATE_TIME") {
        if (!fromDate || !toDate) throw new GqlError({ code: "BAD_USER_INPUT", message: `開始日と終了日がありません` });

        if (fromDate.getTime() < Date.now() || fromDate.getTime() > toDate.getTime())
            throw new GqlError({ code: "BAD_USER_INPUT", message: "開始日が無効です" });

        if (toDate.getTime() < Date.now() || toDate.getTime() < fromDate.getTime())
            throw new GqlError({ code: "BAD_USER_INPUT", message: "終了日が無効です" });
    }

    if (!amount || amount <= 0) throw new GqlError({ code: "BAD_USER_INPUT", message: "価格が無効です" });
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
                        ? { AND: [{ daysOfWeek: { hasSome: daysOfWeek } }, { isDeleted: false }] }
                        : {
                              OR: [
                                  {
                                      AND: [
                                          { fromDate: { lte: fromDate } },
                                          { toDate: { gte: toDate } },
                                          { isDeleted: false },
                                      ],
                                  },
                                  {
                                      AND: [
                                          { fromDate: { gte: fromDate } },
                                          { fromDate: { lte: toDate } },
                                          { isDeleted: false },
                                      ],
                                  },
                                  {
                                      AND: [
                                          { toDate: { gte: fromDate } },
                                          { toDate: { lte: toDate } },
                                          { isDeleted: false },
                                      ],
                                  },
                              ],
                          },
            },
            space: { select: { accountId: true } },
        },
    });

    Log("addPricePlanOverride: ", pricePlan);

    if (!pricePlan) throw new GqlError({ code: "NOT_FOUND", message: "料金プランが見つかりません" });

    if (accountId !== pricePlan.space.accountId)
        throw new GqlError({ code: "FORBIDDEN", message: "この料金プランは変更できません" });

    if (type === "DATE_TIME") {
        if (pricePlan.fromDate || pricePlan.toDate) {
            if (
                pricePlan.fromDate &&
                (fromDate.getTime() < pricePlan.fromDate.getTime() ||
                    (pricePlan.toDate && fromDate.getTime() > pricePlan.toDate.getTime()))
            ) {
                throw new GqlError({
                    code: "BAD_USER_INPUT",
                    message: `開始日は、料金プランの開始日よりも前またはそれ以降にすることはできません`,
                });
            }
            if (
                pricePlan.toDate &&
                (toDate.getTime() > pricePlan.toDate.getTime() ||
                    (pricePlan.fromDate && toDate.getTime() < pricePlan.fromDate.getTime()))
            ) {
                throw new GqlError({
                    code: "BAD_USER_INPUT",
                    message: `終了日は料金プランの終了日より前またはそれ以降にすることはできません`,
                });
            }
        }
    }

    if (type === "DAY_OF_WEEK") {
        if (pricePlan.fromDate && pricePlan.toDate) {
            const days = getDaysOfWeekBetn(pricePlan.fromDate, pricePlan.toDate, { distinct: true });
            daysOfWeek.forEach((d) => {
                if (!days.includes(d)) {
                    throw new GqlError({
                        code: "BAD_USER_INPUT",
                        message: `${daysOfWeek}の場合と同様に、この料金プランの一部が期間に含まれていないため、この料金プランの上書きを追加することはできません`,
                    });
                }
            });
        }
    }

    pricePlan.overrides.forEach(() => {
        throw new GqlError({
            code: "BAD_USER_INPUT",
            message: `この料金プランには、提供された時間と衝突する上書きがすでに含まれています。`,
        });
    });

    const data = type === "DATE_TIME" ? omit(input, "daysOfWeek") : omit(input, "fromDate", "toDate");

    Log({ data });
    const pricePlanOverride = await store.pricePlanOverride.create({
        data: { ...data, pricePlan: { connect: { id: pricePlanId } } },
    });

    return {
        result: { message: `価格上書きが追加されました` },
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
