import { IFieldResolver } from "@graphql-tools/utils";
import { gql } from "apollo-server-core";
import { GqlError } from "../../error";
import { Context } from "../../context";
import { StockOverrideObject, toStockOverrideSelect } from "./StockOverrideObject";
import { mapSelections } from "graphql-map-selections";
import { isEmpty } from "lodash";
import { Log } from "@utils/logger";

type StockOverridesByOptionIdArgs = { optionId: string };

type StockOverridesByOptionIdResult = StockOverrideObject[];

type StockOverridesByOptionId = IFieldResolver<
    any,
    Context,
    StockOverridesByOptionIdArgs,
    Promise<StockOverridesByOptionIdResult>
>;

const stockOverridesByOptionId: StockOverridesByOptionId = async (_, { optionId }, { authData, store }, info) => {
    const stockOverrideSelect = toStockOverrideSelect(mapSelections(info));
    const option = await store.option.findUnique({
        where: { id: optionId },
        select: { stockOverrides: stockOverrideSelect },
    });
    if (!option) throw new GqlError({ code: "NOT_FOUND", message: "Option not found" });

    let stockOverrides = option.stockOverrides;
    if (isEmpty(option.stockOverrides)) stockOverrides = [];

    Log(stockOverrides);

    return stockOverrides;
};

export const stockOverridesByOptionIdTypeDefs = gql`
    type Query {
        stockOverridesByOptionId(optionId: ID!): [StockOverrideObject]
    }
`;

export const stockOverridesByOptionIdResolvers = { Query: { stockOverridesByOptionId } };
