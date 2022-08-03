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
    if (!accountId) throw new GqlError({ code: "FORBIDDEN", message: "Invalid token!!" });

    stockOverrideIds = compact(stockOverrideIds);
    stockOverrideIds = isEmpty(stockOverrideIds) ? undefined : stockOverrideIds;

    const option = await store.option.findUnique({
        where: { id: optionId },
        select: {
            accountId: true,
            stockOverrides: { where: { id: { in: stockOverrideIds } }, select: { id: true } },
        },
    });
    if (!option || !option.accountId) throw new GqlError({ code: "NOT_FOUND", message: "Option not found" });
    if (accountId !== option.accountId)
        throw new GqlError({ code: "FORBIDDEN", message: "You are not allowed to modify this option" });
    if (isEmpty(option.stockOverrides))
        throw new GqlError({ code: "BAD_REQUEST", message: "Stock override not found." });

    const stockOverridesToRemove = stockOverrideIds
        ? intersectionWith(stockOverrideIds, option.stockOverrides, (a, b) => a === b.id)
        : option.stockOverrides.map(({ id }) => id);

    const updatedOption = await store.option.update({
        where: { id: optionId },
        data: { stockOverrides: { deleteMany: { optionId, id: { in: stockOverridesToRemove } } } },
    });

    Log(updatedOption);

    return {
        message: `Successfully removed ${stockOverridesToRemove.length} stock overrides from your option`,
    };
};

export const removeStockOverrideFromOptionTypeDefs = gql`
    type Mutation {
        removeStockOverrideFromOption(optionId: ID!, stockOverrideIds: [ID]): Result! @auth(requires: [host])
    }
`;

export const removeStockOverrideFromOptionResolvers = { Mutation: { removeStockOverrideFromOption } };
