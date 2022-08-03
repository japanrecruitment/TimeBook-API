import { IFieldResolver } from "@graphql-tools/utils";
import { Log } from "@utils/logger";
import { gql } from "apollo-server-core";
import { compact, intersectionWith, isEmpty } from "lodash";
import { Context } from "../../../context";
import { GqlError } from "../../../error";
import { Result } from "../../core/result";

type RemoveOptionPriceOverrideArgs = { optionId: string; optionPriceOverrideIds: string[] };

type RemoveOptionPriceOverrideResult = Promise<Result>;

type RemoveOptionPriceOverride = IFieldResolver<
    any,
    Context,
    RemoveOptionPriceOverrideArgs,
    RemoveOptionPriceOverrideResult
>;

const removeOptionPriceOverride: RemoveOptionPriceOverride = async (
    _,
    { optionId, optionPriceOverrideIds },
    { authData, store }
) => {
    const { accountId } = authData || {};
    if (!accountId) throw new GqlError({ code: "FORBIDDEN", message: "Invalid token!!" });

    optionPriceOverrideIds = compact(optionPriceOverrideIds);
    optionPriceOverrideIds = isEmpty(optionPriceOverrideIds) ? undefined : optionPriceOverrideIds;

    const option = await store.option.findUnique({
        where: { id: optionId },
        select: {
            accountId: true,
            priceOverrides: { where: { id: { in: optionPriceOverrideIds } }, select: { id: true } },
        },
    });
    if (!option) throw new GqlError({ code: "NOT_FOUND", message: "Option not found" });
    if (accountId !== option.accountId)
        throw new GqlError({ code: "FORBIDDEN", message: "You are not allowed to modify this option" });
    if (isEmpty(option.priceOverrides))
        throw new GqlError({ code: "BAD_REQUEST", message: "Option price override not found." });

    const optionPriceOverridesToRemove = optionPriceOverrideIds
        ? intersectionWith(optionPriceOverrideIds, option.priceOverrides, (a, b) => a === b.id)
        : option.priceOverrides.map(({ id }) => id);

    const updatedOption = await store.option.update({
        where: { id: optionId },
        data: { priceOverrides: { deleteMany: { optionId, id: { in: optionPriceOverridesToRemove } } } },
    });

    Log(updatedOption);

    return {
        message: `Successfully removed ${optionPriceOverridesToRemove.length} option price overrides from your option`,
    };
};

export const removeOptionPriceOverrideTypeDefs = gql`
    type Mutation {
        removeOptionPriceOverride(optionId: ID!, optionPriceOverrideIds: [ID]): Result! @auth(requires: [host])
    }
`;

export const removeOptionPriceOverrideResolvers = { Mutation: { removeOptionPriceOverride } };
