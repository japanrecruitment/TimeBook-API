import { PriceOverride } from "@prisma/client";
import { omit } from "@utils/object-helper";
import { gql } from "apollo-server-core";
import { PrismaSelect } from "graphql-map-selections";
import { isEmpty } from "lodash";
import { PriceSchemeObject, PriceSchemeSelect, toPriceSchemeSelect } from "../price-scheme";

export type PriceOverrideObject = Partial<PriceOverride> & {
    priceScheme: Partial<PriceSchemeObject>;
};

export type PriceOverrideSelect = {
    id: boolean;
    startDate: boolean;
    endDate: boolean;
    priceScheme: PrismaSelect<PriceSchemeSelect>;
    createdAt: boolean;
    updatedAt: boolean;
};

export function toPriceOverrideSelect(selections, defaultValue: any = false): PrismaSelect<PriceOverrideSelect> {
    if (!selections || isEmpty(selections)) return defaultValue;
    const priceSchemeSelect = toPriceSchemeSelect(selections.priceScheme);
    const priceOverrideSelect = omit(selections, "priceScheme");

    return {
        select: {
            ...priceOverrideSelect,
            priceScheme: priceSchemeSelect,
        } as PriceOverrideSelect,
    };
}

export const priceOverrideObjectTypeDefs = gql`
    type PriceOverrideObject {
        id: ID
        startDate: Date
        endDate: Date
        priceScheme: PriceSchemeObject
        createdAt: Date
        updatedAt: Date
    }
`;

export const priceOverrideObjectResolvers = {};
