import { PriceScheme } from "@prisma/client";
import { gql } from "apollo-server-core";
import { PrismaSelect, toPrismaSelect } from "graphql-map-selections";
import { isEmpty } from "lodash";

export type PriceSchemeObject = Partial<PriceScheme>;

export type PriceSchemeSelect = {
    id: boolean;
    name: boolean;
    roomCharge: boolean;
    oneAdultCharge: boolean;
    twoAdultCharge: boolean;
    threeAdultCharge: boolean;
    fourAdultCharge: boolean;
    fiveAdultCharge: boolean;
    sixAdultCharge: boolean;
    sevenAdultCharge: boolean;
    eightAdultCharge: boolean;
    nineAdultCharge: boolean;
    tenAdultCharge: boolean;
    oneChildCharge: boolean;
    twoChildCharge: boolean;
    threeChildCharge: boolean;
    fourChildCharge: boolean;
    fiveChildCharge: boolean;
    sixChildCharge: boolean;
    sevenChildCharge: boolean;
    eightChildCharge: boolean;
    nineChildCharge: boolean;
    tenChildCharge: boolean;
    hotelId: boolean;
    createdAt: boolean;
    updatedAt: boolean;
};

export function toPriceSchemeSelect(selections, defaultValue: any = false): PrismaSelect<PriceSchemeSelect> {
    if (!selections || isEmpty(selections)) return defaultValue;
    return toPrismaSelect(selections);
}

export const priceSchemeObjectTypeDefs = gql`
    type PriceSchemeObject {
        id: ID
        name: String
        roomCharge: Int
        oneAdultCharge: Int
        twoAdultCharge: Int
        threeAdultCharge: Int
        fourAdultCharge: Int
        fiveAdultCharge: Int
        sixAdultCharge: Int
        sevenAdultCharge: Int
        eightAdultCharge: Int
        nineAdultCharge: Int
        tenAdultCharge: Int
        oneChildCharge: Int
        twoChildCharge: Int
        threeChildCharge: Int
        fourChildCharge: Int
        fiveChildCharge: Int
        sixChildCharge: Int
        sevenChildCharge: Int
        eightChildCharge: Int
        nineChildCharge: Int
        tenChildCharge: Int
        hotelId: ID
        createdAt: Date
        updatedAt: Date
    }
`;

export const priceSchemeObjectResolvers = {};
