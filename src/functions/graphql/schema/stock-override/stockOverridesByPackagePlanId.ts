import { IFieldResolver } from "@graphql-tools/utils";
import { gql } from "apollo-server-core";
import { GqlError } from "../../error";
import { Context } from "../../context";
import { StockOverrideObject, toStockOverrideSelect } from "./StockOverrideObject";
import { mapSelections } from "graphql-map-selections";
import { isEmpty } from "lodash";
import { Log } from "@utils/logger";

type StockOverridesByPackagePlanIdArgs = { packagePlanId: string };

type StockOverridesByPackagePlanIdResult = StockOverrideObject[];

type StockOverridesByPackagePlanId = IFieldResolver<
    any,
    Context,
    StockOverridesByPackagePlanIdArgs,
    Promise<StockOverridesByPackagePlanIdResult>
>;

const stockOverridesByPackagePlanId: StockOverridesByPackagePlanId = async (
    _,
    { packagePlanId },
    { authData, store },
    info
) => {
    const stockOverrideSelect = toStockOverrideSelect(mapSelections(info));
    const packagePlan = await store.packagePlan.findUnique({
        where: { id: packagePlanId },
        select: { stockOverrides: stockOverrideSelect },
    });
    if (!packagePlan) throw new GqlError({ code: "NOT_FOUND", message: "プランが見つかりません" });

    let stockOverrides = packagePlan.stockOverrides;
    if (isEmpty(packagePlan.stockOverrides)) stockOverrides = [];

    Log(stockOverrides);

    return stockOverrides;
};

export const stockOverridesByPackagePlanIdTypeDefs = gql`
    type Query {
        stockOverridesByPackagePlanId(packagePlanId: ID!): [StockOverrideObject]
    }
`;

export const stockOverridesByPackagePlanIdResolvers = { Query: { stockOverridesByPackagePlanId } };
