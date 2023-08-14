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
    if (!accountId) throw new GqlError({ code: "FORBIDDEN", message: "無効なリクエスト" });

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
        throw new GqlError({ code: "NOT_FOUND", message: "プランが見つかりません" });
    if (accountId !== packagePlan.hotel.accountId)
        throw new GqlError({ code: "FORBIDDEN", message: "無効なリクエスト" });
    if (isEmpty(packagePlan.stockOverrides))
        throw new GqlError({ code: "BAD_REQUEST", message: "在庫の上書きが見つかりません" });

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
        message: `「${stockOverridesToRemove.length}」在庫の上書きを削除しました`,
    };
};

export const removeStockOverrideFromPackagePlanTypeDefs = gql`
    type Mutation {
        removeStockOverrideFromPackagePlan(packagePlanId: ID!, stockOverrideIds: [ID]): Result! @auth(requires: [host])
    }
`;

export const removeStockOverrideFromPackagePlanResolvers = { Mutation: { removeStockOverrideFromPackagePlan } };
