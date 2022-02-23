import { SpacePricePlan } from "@prisma/client";
import { gql } from "apollo-server-core";
import { toPrismaSelect } from "graphql-map-selections";

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
};

export const toSpacePricePlanSelect = (selection) => toPrismaSelect<SpacePricePlanSelect>(selection);

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
    }
`;
