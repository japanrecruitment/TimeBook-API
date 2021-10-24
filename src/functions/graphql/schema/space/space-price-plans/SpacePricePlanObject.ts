import { SpacePricePlan } from "@prisma/client";
import { gql } from "apollo-server-core";
import { toPrismaSelect } from "graphql-map-selections";

export type SpacePricePlanObject = Partial<SpacePricePlan>;

export type SpacePricePlanSelect = {
    id: boolean;
    title: boolean;
    type: boolean;
    amount: boolean;
    duration: boolean;
    maintenanceFee: boolean;
    lastMinuteDiscount: boolean;
    cooldownTime: boolean;
};

export const toSpacePricePlanSelect = (selection) => toPrismaSelect<SpacePricePlanSelect>(selection);

export const spacePricePlanObjectTypeDefs = gql`
    enum SpacePricePlanType {
        DAILY
        HOURLY
    }

    type SpacePricePlanObject {
        id: ID!
        title: String
        type: SpacePricePlanType
        amount: Float
        duration: Float
        maintenanceFee: Float
        lastMinuteDiscount: Float
        cooldownTime: Int
    }
`;
