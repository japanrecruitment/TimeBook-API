import { IFieldResolver } from "@graphql-tools/utils";
import { gql } from "apollo-server-core";
import { GqlError } from "../../error";
import { Context } from "../../context";
import { StockOverrideObject, toStockOverrideSelect } from "./StockOverrideObject";
import { mapSelections } from "graphql-map-selections";
import { Log } from "@utils/logger";

type StockOverrideFilterOptions = {
    hotelRoomId?: string;
    packagePlanId?: string;
    optionId?: string;
};

type AllStockOverridesArgs = { filter?: StockOverrideFilterOptions };

type AllStockOverridesResult = StockOverrideObject[];

type AllStockOverrides = IFieldResolver<any, Context, AllStockOverridesArgs, Promise<AllStockOverridesResult>>;

const allStockOverrides: AllStockOverrides = async (_, { filter }, { store }, info) => {
    const { hotelRoomId, optionId, packagePlanId } = filter || {};

    const stockOverrideSelect = toStockOverrideSelect(mapSelections(info))?.select;
    const stockOverrides = await store.stockOverride.findMany({
        where: { hotelRoomId, optionId, packagePlanId },
        select: stockOverrideSelect,
    });

    Log(stockOverrides);

    return stockOverrides;
};

export const allStockOverridesTypeDefs = gql`
    type StockOverrideFilterOptions {
        hotelRoomId: ID
        packagePlanId: ID
        optionId: ID
    }

    type Query {
        allStockOverrides(filter: StockOverrideFilterOptions): [StockOverrideObject]
    }
`;

export const allStockOverridesResolvers = { Query: { allStockOverrides } };
