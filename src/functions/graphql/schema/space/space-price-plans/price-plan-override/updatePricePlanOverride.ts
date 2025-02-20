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
            throw new GqlError({ code: "BAD_USER_INPUT", message: `曜日がありません` });

        daysOfWeek.forEach((d) => {
            if (d > 6 || d < 0) {
                throw new GqlError({ code: "BAD_USER_INPUT", message: `曜日が無効です` });
            }
        });
    } else if (type === "DATE_TIME") {
        if (!fromDate || !toDate) throw new GqlError({ code: "BAD_USER_INPUT", message: `開始日と終了日は必須です` });

        if (fromDate.getTime() < Date.now() || fromDate.getTime() > toDate.getTime())
            throw new GqlError({ code: "BAD_USER_INPUT", message: "無効な開始日" });

        if (toDate.getTime() < Date.now() || toDate.getTime() < fromDate.getTime())
            throw new GqlError({ code: "BAD_USER_INPUT", message: "無効な終了日" });
    }

    if (!amount || amount <= 0) throw new GqlError({ code: "BAD_USER_INPUT", message: "無効な料金" });
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

    if (!pricePlanOverride) throw new GqlError({ code: "NOT_FOUND", message: "料金プランの上書きが見つかりません" });

    if (accountId !== pricePlanOverride.pricePlan.space.accountId)
        throw new GqlError({ code: "FORBIDDEN", message: "無効なリクエスト" });

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
                    message: `開始日は、料金プランの開始日よりも前またはそれ以降にすることはできません`,
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
                    message: `終了日は料金プランの終了日より前またはそれ以降にすることはできません`,
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
                        message: `${daysOfWeek} の場合と同様に、この料金プランの一部が期間に含まれていないため、この料金プランの上書きを追加することはできません`,
                    });
                }
            });
        }
    }

    const data = type === "DATE_TIME" ? omit(input, "id", "daysOfWeek") : omit(input, "id", "fromDate", "toDate");
    const updatedPricePlanOverride = await store.pricePlanOverride.update({ where: { id }, data });

    return {
        result: { message: `料金プランの上書きが更新されました` },
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
