import { SpacePricePlan } from "@prisma/client";
import { gql } from "apollo-server-core";

export type AddSpacePricePlanInput = Omit<SpacePricePlan, "id" | "createdAt" | "updatedAt">;

export type UpdateSpacePricePlanInput = Required<Pick<SpacePricePlan, "id" | "title" | "type">> &
    Partial<Omit<SpacePricePlan, "id" | "title" | "type" | "createdAt" | "updatedAt">>;

export const spacePricePlanTypeDefs = gql`
    enum SpacePricePlanType {
        DAILY
        HOURLY
    }

    type SpacePricePlan {
        id: ID!
        title: String
        type: SpacePricePlanType
        price: Float
        maintenanceFee: Float
        lastMinuteDiscount: Float
        cooldownTime: Int
    }

    input AddSpacePricePlanInput {
        title: String!
        type: SpacePricePlanType!
        price: Float!
        maintenanceFee: Float
        lastMinuteDiscount: Float
        cooldownTime: Int
    }

    input UpdateSpacePricePlanInput {
        id: ID!
        title: String!
        type: SpacePricePlanType!
        price: Float
        maintenanceFee: Float
        lastMinuteDiscount: Float
        cooldownTime: Int
    }
`;
