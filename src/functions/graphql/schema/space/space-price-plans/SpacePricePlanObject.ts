import { SpacePricePlan } from ".prisma/client";
import { gql } from "apollo-server-express";
import { toPrismaSelect } from "graphql-map-selections";

export type SpacePricePlanObject = Partial<SpacePricePlan>;

export type SpacePricePlanSelect = {
    id: true;
    title: true;
    type: true;
    amount: true;
    duration: true;
    maintenanceFee: true;
    lastMinuteDiscount: true;
    cooldownTime: true;
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
