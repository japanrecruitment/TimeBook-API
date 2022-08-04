import { OptionPriceOverride } from "@prisma/client";
import { gql } from "apollo-server-core";
import { PrismaSelect, toPrismaSelect } from "graphql-map-selections";
import { isEmpty } from "lodash";

export type OptionPriceOverrideObject = Partial<OptionPriceOverride>;

export type OptionPriceOverrideSelect = {
    id: boolean;
    startDate: boolean;
    endDate: boolean;
    price: boolean;
    createdAt: boolean;
    updatedAt: boolean;
};

export function toOptionPriceOverrideSelect(
    selections,
    defaultValue: any = false
): PrismaSelect<OptionPriceOverrideSelect> {
    if (!selections || isEmpty(selections)) return defaultValue;
    return toPrismaSelect<OptionPriceOverrideSelect>(selections);
}

export const optionPriceOverrideObjectTypeDefs = gql`
    type OptionPriceOverrideObject {
        id: ID
        startDate: Date
        endDate: Date
        price: Int
        createdAt: Date
        updatedAt: Date
    }
`;

export const optionPriceOverrideObjectResolvers = {};
