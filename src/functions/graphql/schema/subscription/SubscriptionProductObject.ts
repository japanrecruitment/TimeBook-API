import { gql } from "apollo-server-core";

export type SubscriptionPriceObject = {
    id: string;
    amount: number;
    currency: string;
    name: string;
    priceRange: string;
};

export type SubscriptionProductObject = {
    id: string;
    name: string;
    title: string;
    type: string;
    unit: string;
    prices: SubscriptionPriceObject[];
};

export const subscriptionProductObjectTypeDefs = gql`
    type SubscriptionPriceObject {
        id: ID
        amount: Int
        currency: String
        name: String
        priceRange: String
    }

    type SubscriptionProductObject {
        id: ID
        name: String
        title: String
        type: String
        unit: String
        prices: [SubscriptionPriceObject]
    }
`;

export const subscriptionProductObjectResolvers = {};
