import { SpacePricePlan } from "@prisma/client";
import { gql } from "apollo-server-core";

export type AddSpacePricePlanInput = Omit<SpacePricePlan, "id" | "createdAt" | "updatedAt">;

export type UpdateSpacePricePlanInput = Required<Pick<SpacePricePlan, "id">> &
    Partial<Omit<SpacePricePlan, "id" | "createdAt" | "updatedAt">>;

export const spacePricePlanTypeDefs = gql`
    type SpacePricePlan {
        id: ID!
        planTitle: String
        hourlyPrice: Float
        dailyPrice: Float
        maintenanceFee: Float
        lastMinuteDiscount: Float
        cooldownTime: Int
    }

    input AddSpacePricePlanInput {
        planTitle: String!
        hourlyPrice: Float
        dailyPrice: Float
        maintenanceFee: Float
        lastMinuteDiscount: Float
        cooldownTime: Int
    }

    input UpdateSpacePricePlanInput {
        id: ID!
        planTitle: String
        hourlyPrice: Float
        dailyPrice: Float
        maintenanceFee: Float
        lastMinuteDiscount: Float
        cooldownTime: Int
    }
`;
