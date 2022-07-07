import { BasicPriceSetting } from "@prisma/client";
import { omit } from "@utils/object-helper";
import { gql } from "apollo-server-core";
import { PrismaSelect } from "graphql-map-selections";
import { isEmpty } from "lodash";
import { PriceSchemeObject, PriceSchemeSelect, toPriceSchemeSelect } from "../price-scheme";

export type BasicPriceSettingObject = Partial<BasicPriceSetting> & {
    priceScheme?: Partial<PriceSchemeObject>;
};

export type BasicPriceSettingSelect = {
    id: boolean;
    dayOfWeek: boolean;
    priceScheme: PrismaSelect<PriceSchemeSelect>;
    hotelRoomId: boolean;
    packagePlanId: boolean;
    createdAt: boolean;
    updatedAt: boolean;
};

export function toBasicPriceSettingSelect(
    selections,
    defaultValue: any = false
): PrismaSelect<BasicPriceSettingSelect> {
    if (!selections || isEmpty(selections)) return defaultValue;
    const priceSchemeSelect = toPriceSchemeSelect(selections.priceScheme);
    const basicPriceSettingSelect = omit(selections, "priceScheme");

    if (isEmpty(basicPriceSettingSelect) && !priceSchemeSelect) return defaultValue;

    return {
        select: {
            ...basicPriceSettingSelect,
            priceScheme: priceSchemeSelect,
        } as BasicPriceSettingSelect,
    };
}

export const basicPriceSettingObjectTypeDefs = gql`
    type BasicPriceSettingObject {
        id: ID
        dayOfWeek: Int
        priceScheme: PriceSchemeObject
        hotelRoomId: ID
        packagePlanId: ID
        createdAt: Date
        updatedAt: Date
    }
`;

export const basicPriceSettingObjectResolvers = {};
