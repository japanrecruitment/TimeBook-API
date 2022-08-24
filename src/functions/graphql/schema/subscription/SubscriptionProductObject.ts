import { StripePrice } from "@libs/paymentProvider";
import { Log } from "@utils/logger";
import { gql } from "apollo-server-core";
import { uniqWith } from "lodash";

export function stripePricesToSubscriptionProducts(prices: StripePrice[]): SubscriptionProductObject[] {
    return uniqWith(
        prices.map((price) => price.product),
        (a, b) => a.id === b.id
    ).map<SubscriptionProductObject>((product) => ({
        id: product.id,
        name: product.metadata.name,
        title: product.name,
        type: product.metadata.type,
        unit: product.metadata.unit,
        prices: prices
            .filter((price) => price.product.id === product.id)
            .map((price) => ({
                id: price.id,
                amount: price.unit_amount,
                currency: price.currency,
                name: price.metadata.name,
                priceRange: price.metadata.priceRange,
            }))
            .sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0)),
    }));
}

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
