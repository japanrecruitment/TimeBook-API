import { SpacePricePlan } from "@prisma/client";
import { gql } from "apollo-server-core";
import { PrismaSelect, toPrismaSelect } from "graphql-map-selections";
import { omit } from "lodash";
import { PricePlanOverrideSelect, toPricePlanOverrideSelect } from "./price-plan-override";

export type SpacePricePlanObject = Partial<SpacePricePlan>;

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
    overrides: PrismaSelect<PricePlanOverrideSelect>;
};

export const toSpacePricePlanSelect = (selection): PrismaSelect<SpacePricePlanSelect> => {
    const overridesSelect = toPricePlanOverrideSelect(selection.overrides);

    const spacePricePlanSelect = omit(selection, "overrides");

    return {
        select: {
            ...spacePricePlanSelect,
            overrides: overridesSelect,
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
