import { IFieldResolver } from "@graphql-tools/utils";
import { StripeLib, StripePrice } from "@libs/paymentProvider";
import { Log } from "@utils/logger";
import { gql } from "apollo-server-core";
import { Context } from "../../context";
import { GqlError } from "../../error";
import { SubscriptionObject } from "./SubscriptionObject";

type CreateSubscriptionArgs = { priceId: string };

type CreateSubscriptionResult = { message: string; subscription: SubscriptionObject };

type CreateSubscription = IFieldResolver<any, Context, CreateSubscriptionArgs, Promise<CreateSubscriptionResult>>;

const createSubscription: CreateSubscription = async (_, { priceId }, { authData, dataSources, store }) => {
    const { accountId, id: userId } = authData;
    if (!accountId || !userId) throw new GqlError({ code: "FORBIDDEN", message: "Invalid token!!" });

    const user = await store.user.findUnique({ where: { id: userId }, select: { stripeCustomerId: true } });
    if (!user) throw new GqlError({ code: "BAD_REQUEST", message: "User not found" });
    if (!user.stripeCustomerId) throw new GqlError({ code: "BAD_REQUEST", message: "Stripe account not found" });

    const stripe = new StripeLib();

    const cacheKey = `subscription:price:all`;
    let stripePrices = await dataSources.redis.fetch<StripePrice[]>(cacheKey);
    if (!stripePrices) {
        stripePrices = await stripe.listPrices();
        dataSources.redis.store(cacheKey, stripePrices, 86400);
    }
    const stripePrice = stripePrices?.find((price) => price.id === priceId);

    if (!stripePrice) throw new GqlError({ code: "BAD_REQUEST", message: "Subscription plan not found" });

    const subscriptions = await stripe.listSubscriptions(accountId);

    subscriptions
        .flatMap(({ items }) => items.data.flatMap(({ price }) => price))
        .forEach(({ product }) => {
            if (product.metadata.type === stripePrice.product.metadata.type) {
                throw new GqlError({
                    code: "FORBIDDEN",
                    message: `You have already subscribed to ${stripePrice.product.metadata.type} subscription`,
                });
            }
        });

    try {
        const stripeSubscription = await stripe.createSubscription(
            user.stripeCustomerId,
            priceId,
            stripePrice.product.metadata.type,
            accountId
        );

        const subscription = await store.subscription.create({
            data: {
                stripePriceId: stripePrice.id,
                stripeProductId: stripePrice.product.id,
                stripeSubId: stripeSubscription.id,
                account: { connect: { id: accountId } },
            },
            select: { id: true },
        });

        Log(`createSubscription: `, subscription);

        return {
            message: "Created subscription",
            subscription: {
                id: subscription.id,
                amount: stripePrice.unit_amount,
                currentPeriodEnd: new Date(stripeSubscription.current_period_end),
                currentPeriodStart: new Date(stripeSubscription.current_period_start),
                name: stripePrice.product.metadata.name,
                remainingUnit: parseInt(stripePrice.product.metadata.unit),
                type: stripePrice.product.metadata.type,
                unit: parseInt(stripePrice.product.metadata.unit),
            },
        };
    } catch (error) {
        throw new GqlError({ code: "FORBIDDEN", message: error.message });
    }
};

export const createSubscriptionTypeDefs = gql`
    type CreateSubscriptionResult {
        message: String!
        subscription: SubscriptionObject
    }

    type Mutation {
        createSubscription(priceId: ID!): CreateSubscriptionResult @auth(requires: [user])
    }
`;

export const createSubscriptionResolvers = { Mutation: { createSubscription } };
