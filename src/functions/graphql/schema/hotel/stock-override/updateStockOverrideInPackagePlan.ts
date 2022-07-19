import { IFieldResolver } from "@graphql-tools/utils";
import { Log } from "@utils/logger";
import { gql } from "apollo-server-core";
import { mapSelections } from "graphql-map-selections";
import { isEmpty } from "lodash";
import { Context } from "../../../context";
import { GqlError } from "../../../error";
import { StockOverrideObject, toStockOverrideSelect } from "./StockOverrideObject";
import { UpdateStockOverrideInput, validateUpdateStockOverrideInput } from "./updateStockOverride";

type UpdateStockOverrideInPackagePlanArgs = {
    input: UpdateStockOverrideInput;
};

type UpdateStockOverrideInPackagePlanResult = {
    message: string;
    stockOverride?: StockOverrideObject;
};

type UpdateStockOverrideInPackagePlan = IFieldResolver<
    any,
    Context,
    UpdateStockOverrideInPackagePlanArgs,
    Promise<UpdateStockOverrideInPackagePlanResult>
>;

const updateStockOverrideInPackagePlan: UpdateStockOverrideInPackagePlan = async (
    _,
    { input },
    { authData, store },
    info
) => {
    const { accountId } = authData || {};
    if (!accountId) throw new GqlError({ code: "FORBIDDEN", message: "Invalid token!!" });

    const { id, endDate, stock, startDate } = validateUpdateStockOverrideInput(input);

    const stockOverride = await store.stockOverride.findUnique({
        where: { id },
        select: {
            packagePlan: {
                select: {
                    hotel: { select: { accountId: true } },
                    stockOverrides:
                        endDate && startDate
                            ? {
                                  where: {
                                      id: { not: id },
                                      OR: [
                                          { AND: [{ startDate: { gte: startDate } }, { startDate: { lte: endDate } }] },
                                          { AND: [{ endDate: { gte: startDate } }, { endDate: { lte: endDate } }] },
                                      ],
                                  },
                              }
                            : undefined,
                },
            },
        },
    });
    if (!stockOverride || !stockOverride.packagePlan?.hotel)
        throw new GqlError({ code: "NOT_FOUND", message: "Stock override not found" });
    if (accountId !== stockOverride.packagePlan.hotel.accountId)
        throw new GqlError({ code: "FORBIDDEN", message: "You are not allowed to modify this hotel package" });
    if (!isEmpty(stockOverride.packagePlan.stockOverrides))
        throw new GqlError({ code: "BAD_REQUEST", message: "Overlapping stock override found." });

    const stockOverrideSelect = toStockOverrideSelect(mapSelections(info)?.stockOverride)?.select;
    const newStockOverride = await store.stockOverride.update({
        where: { id },
        data: { endDate, startDate, stock },
        select: stockOverrideSelect,
    });

    Log(newStockOverride);

    return {
        message: "Successfully updated stock override in hotel package",
        stockOverride: newStockOverride,
    };
};

export const updateStockOverrideInPackagePlanTypeDefs = gql`
    type UpdateStockOverrideInPackagePlanResult {
        message: String!
        stockOverride: StockOverrideObject
    }

    type Mutation {
        updateStockOverrideInPackagePlan(input: UpdateStockOverrideInput!): UpdateStockOverrideInPackagePlanResult!
            @auth(requires: [host])
    }
`;

export const updateStockOverrideInPackagePlanResolvers = { Mutation: { updateStockOverrideInPackagePlan } };
