import { IFieldResolver } from "@graphql-tools/utils";
import { StripeLib, StripePrice } from "@libs/paymentProvider";
import { Log } from "@utils/logger";
import { gql } from "apollo-server-core";
import { mapSelections } from "graphql-map-selections";
import { Context } from "../../context";
import { GqlError } from "../../error";
import { SubscriptionObject, toSubscriptionSelect } from "./SubscriptionObject";

type CreateSubscriptionArgs = { priceId: string };

type CreateSubscriptionResult = { message: string; subscription: SubscriptionObject };

type CreateSubscription = IFieldResolver<any, Context, CreateSubscriptionArgs, Promise<CreateSubscriptionResult>>;

const createSubscription: CreateSubscription = async (_, { priceId }, { authData, dataSources, store }, info) => {
    const { accountId, email, id: userId } = authData;
    if (!accountId || !email || !userId) throw new GqlError({ code: "FORBIDDEN", message: "Invalid token!!" });

    const user = await store.user.findUnique({ where: { id: userId }, select: { stripeCustomerId: true } });

    if (!user) throw new GqlError({ code: "BAD_REQUEST", message: "User not found" });

    if (!user.stripeCustomerId) throw new GqlError({ code: "BAD_REQUEST", message: "Stripe account not found" });

    const stripe = new StripeLib();

    const cacheKey = `subscription:price:${priceId}`;
    let stripePrice = await dataSources.redis.fetch<StripePrice>(cacheKey);
    if (!stripePrice) {
        stripePrice = await stripe.retrievePrice(priceId);
        dataSources.redis.store(cacheKey, stripePrice, 604800);
    }

    if (!stripePrice) throw new GqlError({ code: "BAD_REQUEST", message: "Subscription plan not found" });

    const subscriptions = await store.subscription.findMany({ where: { accountId, isCanceled: false } });
    subscriptions.forEach((sub) => {
        if (sub.type === stripePrice.product.metadata.type) {
            throw new GqlError({
                code: "FORBIDDEN",
                message: `You have already subscribed to ${sub.type} subscription`,
            });
        }
    });

    const stripeSubscription = await stripe.createSubscription(user.stripeCustomerId, priceId);

    const subscriptionSelect = toSubscriptionSelect(mapSelections(info))?.select;
    const subscription = await store.subscription.create({
        data: {
            amount: stripePrice.unit_amount,
            currentPeriodEnd: new Date(stripeSubscription.current_period_end),
            currentPeriodStart: new Date(stripeSubscription.current_period_start),
            name: stripePrice.product.metadata.name,
            remainingUnit: parseInt(stripePrice.metadata.unit),
            stripePriceId: stripePrice.id,
            stripeProductId: stripePrice.product.id,
            stripeSubId: stripeSubscription.id,
            type: stripePrice.product.metadata.type,
            unit: parseInt(stripePrice.metadata.unit),
            account: { connect: { id: accountId } },
        },
        select: subscriptionSelect,
    });

    Log(`createSubscription: `, subscription);

    return {
        message: "Created subscription",
        subscription,
    };
};

export const createSubscriptionTypeDefs = gql`
    type CreateSubscriptionResult {
        message: String!
        subcription: SubscriptionObject
    }

    type Mutation {
        createSubscription(priceId: ID!): CreateSubscriptionResult @auth(requires: [user])
    }
`;

export const createSubscriptionResolvers = { Mutation: { createSubscription } };
