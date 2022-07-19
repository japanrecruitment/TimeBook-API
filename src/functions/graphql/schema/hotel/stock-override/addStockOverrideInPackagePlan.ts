import { IFieldResolver } from "@graphql-tools/utils";
import { Log } from "@utils/logger";
import { gql } from "apollo-server-core";
import { mapSelections } from "graphql-map-selections";
import { isEmpty } from "lodash";
import { Context } from "../../../context";
import { GqlError } from "../../../error";
import { AddStockOverrideInput, validateAddStockOverrideInput } from "./addStockOverride";
import { StockOverrideObject, toStockOverrideSelect } from "./StockOverrideObject";

type AddStockOverrideInPackagePlanArgs = {
    packagePlanId: string;
    stockOverride: AddStockOverrideInput;
};

type AddStockOverrideInPackagePlanResult = {
    message: string;
    stockOverride?: StockOverrideObject;
};

type AddStockOverrideInPackagePlan = IFieldResolver<
    any,
    Context,
    AddStockOverrideInPackagePlanArgs,
    Promise<AddStockOverrideInPackagePlanResult>
>;

const addStockOverrideInPackagePlan: AddStockOverrideInPackagePlan = async (
    _,
    { packagePlanId, stockOverride },
    { authData, store },
    info
) => {
    const { accountId } = authData || {};
    if (!accountId) throw new GqlError({ code: "FORBIDDEN", message: "Invalid token!!" });

    const { endDate, stock, startDate } = validateAddStockOverrideInput(stockOverride);

    const packagePlan = await store.packagePlan.findUnique({
        where: { id: packagePlanId },
        select: {
            hotel: { select: { accountId: true } },
            stockOverrides: {
                where: {
                    packagePlanId,
                    OR: [
                        { AND: [{ startDate: { gte: startDate } }, { startDate: { lte: endDate } }] },
                        { AND: [{ endDate: { gte: startDate } }, { endDate: { lte: endDate } }] },
                    ],
                },
            },
        },
    });
    if (!packagePlan || !packagePlan.hotel)
        throw new GqlError({ code: "NOT_FOUND", message: "Package plan not found" });
    if (accountId !== packagePlan.hotel.accountId)
        throw new GqlError({ code: "FORBIDDEN", message: "You are not allowed to modify this hotel package" });
    if (!isEmpty(packagePlan.stockOverrides))
        throw new GqlError({ code: "BAD_REQUEST", message: "Overlapping stock override found." });

    const stockOverrideSelect = toStockOverrideSelect(mapSelections(info)?.stockOverride)?.select;
    const newStockOverride = await store.stockOverride.create({
        data: {
            endDate,
            startDate,
            stock,
            packagePlan: { connect: { id: packagePlanId } },
        },
        select: stockOverrideSelect,
    });

    Log(newStockOverride);

    return {
        message: "Successfully added stock override in package plan",
        stockOverride: newStockOverride,
    };
};

export const addStockOverrideInPackagePlanTypeDefs = gql`
    type AddStockOverrideInPackagePlanResult {
        message: String!
        stockOverride: StockOverrideObject
    }

    type Mutation {
        addStockOverrideInPackagePlan(
            packagePlanId: ID!
            stockOverride: AddStockOverrideInput!
        ): AddStockOverrideInPackagePlanResult! @auth(requires: [host])
    }
`;

export const addStockOverrideInPackagePlanResolvers = { Mutation: { addStockOverrideInPackagePlan } };
