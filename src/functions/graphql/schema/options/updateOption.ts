import { IFieldResolver } from "@graphql-tools/utils";
import { OptionPaymentTerm } from "@prisma/client";
import { Log } from "@utils/logger";
import { gql } from "apollo-server-core";
import { mapSelections } from "graphql-map-selections";
import { isEmpty } from "lodash";
import { Context } from "src/functions/graphql/context";
import { GqlError } from "src/functions/graphql/error";
import { OptionObject, toOptionSelect } from "./OptionObject";

function validateUpdateOptionInput(input: UpdateOptionInput): UpdateOptionInput {
    let {
        id,
        additionalPrice,
        cutOffBeforeDays,
        cutOffTillTime,
        description,
        endReservation,
        endUsage,
        name,
        paymentTerm,
        startReservation,
        startUsage,
        stock,
    } = input;

    description = description?.trim();
    name = name?.trim();

    if (isEmpty(description)) description = undefined;
    if (isEmpty(name)) name = undefined;
    if (!additionalPrice) additionalPrice = null;
    if (!startUsage) startUsage = null;
    if (!endUsage) endUsage = null;
    if (!startReservation) startReservation = null;
    if (!endReservation) endReservation = null;
    if (!cutOffBeforeDays) cutOffBeforeDays = null;
    if (!cutOffTillTime) cutOffTillTime = null;
    if (!stock) stock = null;

    if ((startUsage && !endUsage) || (!startUsage && endUsage))
        throw new GqlError({ code: "BAD_USER_INPUT", message: "使用開始期間と終了期間を入力してください" });

    if (startUsage?.getTime() > endUsage?.getTime())
        throw new GqlError({ code: "BAD_USER_INPUT", message: "利用期間が無効です" });

    if ((startReservation && !endReservation) || (!startReservation && endReservation))
        throw new GqlError({ code: "BAD_USER_INPUT", message: "予約の開始期間と終了期間を入力してください" });

    if (startReservation?.getTime() > endReservation?.getTime())
        throw new GqlError({ code: "BAD_USER_INPUT", message: "予約期間が無効です" });

    if (cutOffBeforeDays && cutOffBeforeDays < 0)
        throw new GqlError({ code: "BAD_USER_INPUT", message: "無効な締め切り日" });

    if ((additionalPrice && !paymentTerm) || (!additionalPrice && paymentTerm))
        throw new GqlError({ code: "BAD_USER_INPUT", message: "支払い期間と追加料金を入力してください" });

    if (additionalPrice && additionalPrice < 0)
        throw new GqlError({ code: "BAD_USER_INPUT", message: "無効な追加料金" });

    if (stock && stock < 0) throw new GqlError({ code: "BAD_USER_INPUT", message: "在庫数が無効です" });

    return {
        id,
        additionalPrice,
        cutOffBeforeDays,
        cutOffTillTime,
        description,
        endReservation,
        endUsage,
        name,
        paymentTerm,
        startReservation,
        startUsage,
        stock,
    };
}

type UpdateOptionInput = {
    id: string;
    name?: string;
    description?: string;
    startUsage?: Date;
    endUsage?: Date;
    startReservation?: Date;
    endReservation?: Date;
    cutOffBeforeDays?: number;
    cutOffTillTime?: Date;
    paymentTerm?: OptionPaymentTerm;
    additionalPrice?: number;
    stock?: number;
};

type UpdateOptionArgs = { input: UpdateOptionInput };

type UpdateOptionResult = {
    message: string;
    option?: OptionObject;
};

type UpdateOption = IFieldResolver<any, Context, UpdateOptionArgs, Promise<UpdateOptionResult>>;

const updateOption: UpdateOption = async (_, { input }, { authData, store }, info) => {
    const { accountId } = authData || {};
    if (!accountId) throw new GqlError({ code: "FORBIDDEN", message: "無効なリクエスト" });

    const { id, ...data } = validateUpdateOptionInput(input);

    const option = await store.option.findUnique({ where: { id }, select: { accountId: true } });
    if (!option) throw new GqlError({ code: "NOT_FOUND", message: "オプションが見つかりません" });
    if (accountId !== option.accountId) throw new GqlError({ code: "FORBIDDEN", message: "無効なリクエスト" });

    const optionSelect = toOptionSelect(mapSelections(info)?.option)?.select;
    const updatedOption = await store.option.update({
        where: { id },
        data,
        select: optionSelect,
    });

    Log("updateOption: ", updatedOption);

    return {
        message: `オプションが更新されました`,
        option: updatedOption,
    };
};

export const updateOptionTypeDefs = gql`
    input UpdateOptionInput {
        id: ID!
        name: String
        description: String
        startUsage: Date
        endUsage: Date
        startReservation: Date
        endReservation: Date
        cutOffBeforeDays: Int
        cutOffTillTime: Time
        paymentTerm: OptionPaymentTerm
        additionalPrice: Int
        stock: Int
    }

    type UpdateOptionResult {
        message: String!
        option: OptionObject
    }

    type Mutation {
        updateOption(input: UpdateOptionInput!): UpdateOptionResult @auth(requires: [host])
    }
`;

export const updateOptionResolvers = { Mutation: { updateOption } };
