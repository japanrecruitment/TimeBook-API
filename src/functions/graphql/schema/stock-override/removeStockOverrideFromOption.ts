import { IFieldResolver } from "@graphql-tools/utils";
import { Log } from "@utils/logger";
import { gql } from "apollo-server-core";
import { compact, intersectionWith, isEmpty } from "lodash";
import { Context } from "../../context";
import { GqlError } from "../../error";
import { Result } from "../core/result";

type RemoveStockOverrideFromOptionArgs = { optionId: string; stockOverrideIds: string[] };

type RemoveStockOverrideFromOptionResult = Promise<Result>;

type RemoveStockOverrideFromOption = IFieldResolver<
    any,
    Context,
    RemoveStockOverrideFromOptionArgs,
    RemoveStockOverrideFromOptionResult
>;

const removeStockOverrideFromOption: RemoveStockOverrideFromOption = async (
    _,
    { optionId, stockOverrideIds },
    { authData, store }
) => {
    const { accountId } = authData || {};
    if (!accountId) throw new GqlError({ code: "FORBIDDEN", message: "無効なリクエスト" });

    stockOverrideIds = compact(stockOverrideIds);
    stockOverrideIds = isEmpty(stockOverrideIds) ? undefined : stockOverrideIds;

    const option = await store.option.findUnique({
        where: { id: optionId },
        select: {
            accountId: true,
            stockOverrides: { where: { id: { in: stockOverrideIds } }, select: { id: true } },
        },
    });
    if (!option || !option.accountId) throw new GqlError({ code: "NOT_FOUND", message: "オプションが見つかりません" });
    if (accountId !== option.accountId) throw new GqlError({ code: "FORBIDDEN", message: "無効なリクエスト" });
    if (isEmpty(option.stockOverrides))
        throw new GqlError({ code: "BAD_REQUEST", message: "在庫の上書きが見つかりません" });

    const stockOverridesToRemove = stockOverrideIds
        ? intersectionWith(stockOverrideIds, option.stockOverrides, (a, b) => a === b.id)
        : option.stockOverrides.map(({ id }) => id);

    const updatedOption = await store.option.update({
        where: { id: optionId },
        data: { stockOverrides: { deleteMany: { optionId, id: { in: stockOverridesToRemove } } } },
    });

    Log(updatedOption);

    return {
        message: `「${stockOverridesToRemove.length}」在庫の上書きを削除しました`,
    };
};

export const removeStockOverrideFromOptionTypeDefs = gql`
    type Mutation {
        removeStockOverrideFromOption(optionId: ID!, stockOverrideIds: [ID]): Result! @auth(requires: [host])
    }
`;

export const removeStockOverrideFromOptionResolvers = { Mutation: { removeStockOverrideFromOption } };
