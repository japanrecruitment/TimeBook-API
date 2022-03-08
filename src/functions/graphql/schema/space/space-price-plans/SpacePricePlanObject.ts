import { SpacePricePlan } from "@prisma/client";
import { gql } from "apollo-server-core";
import { PrismaSelect, toPrismaSelect } from "graphql-map-selections";
import { omit, isEmpty } from "lodash";
import { PricePlanOverrideObject, PricePlanOverrideSelect, toPricePlanOverrideSelect } from "./price-plan-override";

export type SpacePricePlanObject = Partial<SpacePricePlan> & {
    overrides?: PricePlanOverrideObject[];
};

export type SpacePricePlanSelect = {
    id: boolean;
    title: boolean;
    isDefault: boolean;
    type: boolean;
    duration: boolean;
    amount: boolean;
    maintenanceFee: boolean;
    lastMinuteDiscount: boolean;
    cooldownTime: boolean;
    fromDate: boolean;
    toDate: boolean;
    overrides: PrismaSelect<PricePlanOverrideSelect> & { where: { isDeleted: false } };
};

export const toSpacePricePlanSelect = (selections, defaultValue: any = false): PrismaSelect<SpacePricePlanSelect> => {
    if (!selections || isEmpty(selections)) return defaultValue;
    const overridesSelect = toPricePlanOverrideSelect(selections.overrides);

    const spacePricePlanSelect = omit(selections, "overrides");

    return {
        select: {
            ...spacePricePlanSelect,
            overrides: { where: { isDeleted: false }, ...overridesSelect },
        },
    } as PrismaSelect<SpacePricePlanSelect>;
};

export const spacePricePlanObjectTypeDefs = gql`
    enum SpacePricePlanType {
        DAILY
        HOURLY
        MINUTES
    }

    type SpacePricePlanObject {
        id: ID!
        title: String
        isDefault: Boolean
        type: SpacePricePlanType
        duration: Float
        amount: Float
        maintenanceFee: Float
        lastMinuteDiscount: Float
        cooldownTime: Int
        fromDate: Date
        toDate: Date
        overrides: [PricePlanOverrideObject]
    }
`;
