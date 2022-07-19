import { StockOverride } from "@prisma/client";
import { gql } from "apollo-server-core";
import { PrismaSelect, toPrismaSelect } from "graphql-map-selections";
import { isEmpty } from "lodash";

export type StockOverrideObject = Partial<StockOverride>;

export type StockOverrideSelect = {
    id: boolean;
    startDate: boolean;
    endDate: boolean;
    stock: boolean;
    createdAt: boolean;
    updatedAt: boolean;
};

export function toStockOverrideSelect(selections, defaultValue: any = false): PrismaSelect<StockOverrideSelect> {
    if (!selections || isEmpty(selections)) return defaultValue;
    return toPrismaSelect<StockOverrideSelect>(selections);
}

export const stockOverrideObjectTypeDefs = gql`
    type StockOverrideObject {
        id: ID
        startDate: Date
        endDate: Date
        stock: Int
        createdAt: Date
        updatedAt: Date
    }
`;

export const stockOverrideObjectResolvers = {};
