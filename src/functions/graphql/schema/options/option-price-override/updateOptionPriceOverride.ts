import { IFieldResolver } from "@graphql-tools/utils";
import { OptionPaymentTerm } from "@prisma/client";
import { Log } from "@utils/logger";
import { gql } from "apollo-server-core";
import { mapSelections } from "graphql-map-selections";
import { isEmpty } from "lodash";
import { Context } from "../../../context";
import { GqlError } from "../../../error";
import { OptionPriceOverrideObject, toOptionPriceOverrideSelect } from "./OptionPriceOverrideObject";

export function validateUpdateOptionPriceOverrideInput(
    input: UpdateOptionPriceOverrideInput
): UpdateOptionPriceOverrideInput {
    let { id, endDate, price, startDate } = input;

    if (endDate && startDate) {
        if (endDate < startDate) throw new GqlError({ code: "BAD_USER_INPUT", message: "選択された日付が無効です" });
        if (startDate < new Date()) throw new GqlError({ code: "BAD_USER_INPUT", message: "選択された日付が無効です" });
    } else {
        endDate = undefined;
        startDate = undefined;
    }

    if (price && price < 0) throw new GqlError({ code: "BAD_USER_INPUT", message: "在庫数が無効です" });

    if (!endDate && price && !startDate)
        throw new GqlError({ code: "BAD_REQUEST", message: "必要な情報をすべて入力してください" });

    return { id, endDate, price, startDate };
}

export type UpdateOptionPriceOverrideInput = {
    id: string;
    startDate?: Date;
    endDate?: Date;
    price?: number;
};

type UpdateOptionPriceOverrideArgs = {
    optionId: string;
    input: UpdateOptionPriceOverrideInput;
};

type UpdateOptionPriceOverrideResult = {
    message: string;
    optionPriceOverride?: OptionPriceOverrideObject;
};

type UpdateOptionPriceOverride = IFieldResolver<
    any,
    Context,
    UpdateOptionPriceOverrideArgs,
    Promise<UpdateOptionPriceOverrideResult>
>;

const updateOptionPriceOverride: UpdateOptionPriceOverride = async (
    _,
    { input, optionId },
    { authData, store },
    info
) => {
    const { accountId } = authData || {};
    if (!accountId) throw new GqlError({ code: "FORBIDDEN", message: "無効なリクエスト" });

    const { id, endDate, price, startDate } = validateUpdateOptionPriceOverrideInput(input);

    const option = await store.option.findUnique({
        where: { id: optionId },
        select: {
            accountId: true,
            priceOverrides:
                endDate && startDate
                    ? {
                          where: {
                              optionId,
                              OR: [
                                  { AND: [{ startDate: { gte: startDate } }, { startDate: { lte: endDate } }] },
                                  { AND: [{ endDate: { gte: startDate } }, { endDate: { lte: endDate } }] },
                              ],
                          },
                      }
                    : undefined,
        },
    });
    if (!option) throw new GqlError({ code: "NOT_FOUND", message: "オプションが見つかりません" });
    if (accountId !== option.accountId) throw new GqlError({ code: "FORBIDDEN", message: "無効なリクエスト" });
    if (!isEmpty(option.priceOverrides))
        throw new GqlError({ code: "BAD_REQUEST", message: "重複する料金の上書きが見つかりました" });

    const optionPriceOverrideSelect = toOptionPriceOverrideSelect(mapSelections(info)?.optionPriceOverride)?.select;
    const newOptionPriceOverride = await store.optionPriceOverride.update({
        where: { id },
        data: {
            endDate,
            price,
            startDate,
        },
        select: optionPriceOverrideSelect,
    });

    Log(newOptionPriceOverride);

    return {
        message: `料金の上書きが更新されました`,
        optionPriceOverride: newOptionPriceOverride,
    };
};

export const updateOptionPriceOverrideTypeDefs = gql`
    input UpdateOptionPriceOverrideInput {
        id: ID!
        startDate: Date
        endDate: Date
        price: Int
    }

    type UpdateOptionPriceOverrideResult {
        message: String!
        optionPriceOverride: OptionPriceOverrideObject
    }

    type Mutation {
        updateOptionPriceOverride(optionId: ID!, input: AddOptionPriceOverrideInput!): UpdateOptionPriceOverrideResult
            @auth(requires: [host])
    }
`;

export const updateOptionPriceOverrideResolvers = { Mutation: { updateOptionPriceOverride } };
