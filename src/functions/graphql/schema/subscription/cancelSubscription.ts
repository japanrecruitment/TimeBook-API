import { IFieldResolver } from "@graphql-tools/utils";
import { StripeLib, StripePrice } from "@libs/paymentProvider";
import { Log } from "@utils/logger";
import { gql } from "apollo-server-core";
import { mapSelections } from "graphql-map-selections";
import { Context } from "../../context";
import { GqlError } from "../../error";
import { SubscriptionObject, toSubscriptionSelect } from "./SubscriptionObject";

type CancelSubscriptionArgs = { id: string };

type CancelSubscriptionResult = { message: string };

type CancelSubscription = IFieldResolver<any, Context, CancelSubscriptionArgs, Promise<CancelSubscriptionResult>>;

const cancelSubscription: CancelSubscription = async (_, { id }, { authData, dataSources, store }, info) => {
    const { accountId } = authData;
    if (!accountId) throw new GqlError({ code: "FORBIDDEN", message: "Invalid token!!" });

    const subscription = await store.subscription.findUnique({ where: { id } });

    if (!subscription) throw new GqlError({ code: "BAD_REQUEST", message: "Subscription not found" });

    if (!subscription.isCanceled)
        throw new GqlError({ code: "BAD_REQUEST", message: "Subscription is already canceled" });

    const stripe = new StripeLib();

    await stripe.cancelSubscription(subscription.stripeSubId);
    await store.subscription.update({ where: { id }, data: { isCanceled: true } });

    Log(`cancelSubscription: `, subscription);

    return { message: "Subscription canceled" };
};

export const cancelSubscriptionTypeDefs = gql`
    type CancelSubscriptionResult {
        message: String!
    }

    type Mutation {
        cancelSubscription(id: ID!): CancelSubscriptionResult @auth(requires: [user])
    }
`;

export const cancelSubscriptionResolvers = { Mutation: { cancelSubscription } };
