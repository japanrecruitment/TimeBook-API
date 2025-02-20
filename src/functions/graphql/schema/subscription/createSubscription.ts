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
    if (!accountId || !userId) throw new GqlError({ code: "FORBIDDEN", message: "無効なリクエスト" });

    const user = await store.user.findUnique({ where: { id: userId }, select: { stripeCustomerId: true } });
    if (!user) throw new GqlError({ code: "BAD_REQUEST", message: "ユーザーが見つかりません" });
    if (!user.stripeCustomerId)
        throw new GqlError({ code: "BAD_REQUEST", message: "ストライプアカウントが見つかりません" });

    const stripe = new StripeLib();

    const cacheKey = `subscription:price:all`;
    let stripePrices = await dataSources.redis.fetch<StripePrice[]>(cacheKey);
    if (!stripePrices) {
        stripePrices = await stripe.listPrices();
        dataSources.redis.store(cacheKey, stripePrices, 86400);
    }
    const stripePrice = stripePrices?.find((price) => price.id === priceId);

    if (!stripePrice) throw new GqlError({ code: "BAD_REQUEST", message: "サブスクリプションプランが見つかりません" });

    const subscriptions = await stripe.listSubscriptions(accountId);

    subscriptions
        .flatMap(({ items }) => items.data.flatMap(({ price }) => price))
        .forEach(({ product }) => {
            if (product.metadata.type === stripePrice.product.metadata.type) {
                throw new GqlError({
                    code: "FORBIDDEN",
                    message: `すでに「${stripePrice.product.metadata.type}」サブスクリプションプランに登録しています`,
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
        });

        await stripe.updateSubscriptionMetadata(stripeSubscription.id, {
            ...stripeSubscription.metadata,
            id: subscription.id,
        });

        Log(`createSubscription: `, subscription);

        return {
            message: "Created subscription",
            subscription: {
                id: subscription.id,
                amount: stripePrice.unit_amount,
                currentPeriodEnd: new Date(stripeSubscription.current_period_end),
                currentPeriodStart: new Date(stripeSubscription.current_period_start),
                isCanceled: subscription.isCanceled,
                name: stripePrice.product.metadata.name,
                priceType: stripePrice.metadata.name,
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
