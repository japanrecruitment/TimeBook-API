import { IFieldResolver } from "@graphql-tools/utils";
import { StripeLib, StripePrice } from "@libs/paymentProvider";
import { Log } from "@utils/logger";
import { gql } from "apollo-server-core";
import { uniqWith } from "lodash";
import { Context } from "../../context";
import { stripePricesToSubscriptionProducts, SubscriptionProductObject } from "./SubscriptionProductObject";

type AllSubscriptionProductsResult = SubscriptionProductObject[];

type AllSubscriptionProducts = IFieldResolver<any, Context, any, Promise<AllSubscriptionProductsResult>>;

const allSubscriptionProducts: AllSubscriptionProducts = async (_, __, { dataSources }) => {
    const cacheKey = `subscription:price:all`;
    Log(process.env.NODE_ENV);
    let prices = await dataSources.redis.fetch<StripePrice[]>(cacheKey);
    if (!prices) {
        const stripe = new StripeLib();
        prices = await stripe.listPrices();
        Log("Prices from stripe", prices);
        dataSources.redis.store(cacheKey, prices, 86400);
    }
    Log("Prices sent for parsing...", prices);
    const products = stripePricesToSubscriptionProducts(prices);

    // Log(`SubscriptionPriceObject`, products);

    return products;
};

export const allSubscriptionProductsTypeDefs = gql`
    type Query {
        allSubscriptionProducts: [SubscriptionProductObject]
    }
`;

export const allSubscriptionProductsResolvers = { Query: { allSubscriptionProducts } };
