import { IFieldResolver } from "@graphql-tools/utils";
import { Log } from "@utils/logger";
import { gql } from "apollo-server-core";
import { compact, intersectionWith, isEmpty } from "lodash";
import { Context } from "../../context";
import { GqlError } from "../../error";
import { Result } from "../core/result";

type RemoveStockOverrideFromPackagePlanArgs = { packagePlanId: string; stockOverrideIds: string[] };

type RemoveStockOverrideFromPackagePlanResult = Promise<Result>;

type RemoveStockOverrideFromPackagePlan = IFieldResolver<
    any,
    Context,
    RemoveStockOverrideFromPackagePlanArgs,
    RemoveStockOverrideFromPackagePlanResult
>;

const removeStockOverrideFromPackagePlan: RemoveStockOverrideFromPackagePlan = async (
    _,
    { packagePlanId, stockOverrideIds },
    { authData, store }
) => {
    const { accountId } = authData || {};
    if (!accountId) throw new GqlError({ code: "FORBIDDEN", message: "Invalid token!!" });

    stockOverrideIds = compact(stockOverrideIds);
    stockOverrideIds = isEmpty(stockOverrideIds) ? undefined : stockOverrideIds;

    const packagePlan = await store.packagePlan.findUnique({
        where: { id: packagePlanId },
        select: {
            hotel: { select: { accountId: true } },
            stockOverrides: { where: { id: { in: stockOverrideIds } }, select: { id: true } },
        },
    });
    if (!packagePlan || !packagePlan.hotel)
        throw new GqlError({ code: "NOT_FOUND", message: "Package plan not found" });
    if (accountId !== packagePlan.hotel.accountId)
        throw new GqlError({ code: "FORBIDDEN", message: "You are not allowed to modify this hotel package" });
    if (isEmpty(packagePlan.stockOverrides))
        throw new GqlError({ code: "BAD_REQUEST", message: "Stock override not found." });

    const stockOverridesToRemove = stockOverrideIds
        ? intersectionWith(stockOverrideIds, packagePlan.stockOverrides, (a, b) => a === b.id)
        : packagePlan.stockOverrides.map(({ id }) => id);

    const updatedHotelPackage = await store.packagePlan.update({
        where: { id: packagePlanId },
        data: {
            stockOverrides: {
                deleteMany: { packagePlanId: packagePlanId, id: { in: stockOverridesToRemove } },
            },
        },
    });

    Log(updatedHotelPackage);

    return {
        message: `Successfully removed ${stockOverridesToRemove.length} stock overrides from your hotel package`,
    };
};

export const removeStockOverrideFromPackagePlanTypeDefs = gql`
    type Mutation {
        removeStockOverrideFromPackagePlan(packagePlanId: ID!, stockOverrideIds: [ID]): Result! @auth(requires: [host])
    }
`;

export const removeStockOverrideFromPackagePlanResolvers = { Mutation: { removeStockOverrideFromPackagePlan } };
