import { IFieldResolver } from "@graphql-tools/utils";
import { StripeLib } from "@libs/paymentProvider";
import { Log } from "@utils/logger";
import { gql } from "apollo-server-core";
import { uniqWith } from "lodash";
import { Context } from "../../context";
import { SubscriptionProductObject } from "./SubscriptionProductObject";

type AllSubscriptionProductsResult = SubscriptionProductObject[];

type AllSubscriptionProducts = IFieldResolver<any, Context, any, Promise<AllSubscriptionProductsResult>>;

const allSubscriptionProducts: AllSubscriptionProducts = async (_, __, { dataSources }) => {
    const cacheKey = `subscription-products`;
    const cacheDoc = await dataSources.redis.fetch(cacheKey);
    if (cacheDoc) return cacheDoc;
    const stripe = new StripeLib();
    const prices = await stripe.listSubscriptionPrices();
    const products = uniqWith(
        prices.data.map((price) => price.product),
        (a, b) => a.id === b.id
    ).map<SubscriptionProductObject>((product) => ({
        id: product.id,
        name: product.metadata.name,
        title: product.name,
        type: product.metadata.type,
        unit: product.metadata.unit,
        prices: prices.data
            .filter((price) => price.product.id === product.id)
            .map((price) => ({
                id: price.id,
                amount: price.unit_amount,
                currency: price.currency,
                name: price.metadata.name,
                priceRange: price.metadata.priceRange,
            })),
    }));

    dataSources.redis.store(cacheKey, products, 604800);
    Log(`SubscriptionPriceObject`, products);

    return products;
};

export const allSubscriptionProductsTypeDefs = gql`
    type Query {
        allSubscriptionProducts: [SubscriptionProductObject]
    }
`;

export const allSubscriptionProductsResolvers = { Query: { allSubscriptionProducts } };
