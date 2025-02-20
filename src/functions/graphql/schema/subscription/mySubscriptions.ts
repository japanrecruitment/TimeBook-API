import { IFieldResolver } from "@graphql-tools/utils";
import { StripeLib } from "@libs/paymentProvider";
import { Log } from "@utils/logger";
import { gql } from "apollo-server-core";
import { Context } from "../../context";
import { GqlError } from "../../error";
import { mapStripeSubscriptionToSubscriptionObject, SubscriptionObject } from "./SubscriptionObject";

type MySubscriptionsArgs = any;

type MySubscriptionsResult = SubscriptionObject[];

type MySubscriptions = IFieldResolver<any, Context, MySubscriptionsArgs, Promise<MySubscriptionsResult>>;

const mySubscriptions: MySubscriptions = async (_, __, { authData, store }) => {
    const { accountId, id: userId } = authData;
    if (!accountId || !userId) throw new GqlError({ code: "FORBIDDEN", message: "無効なリクエスト" });

    const user = await store.user.findUnique({ where: { id: userId }, select: { stripeCustomerId: true } });
    if (!user) throw new GqlError({ code: "BAD_REQUEST", message: "ユーザーが見つかりません" });
    if (!user.stripeCustomerId)
        throw new GqlError({ code: "BAD_REQUEST", message: "ストライプアカウントが見つかりません" });

    const stripe = new StripeLib();
    const stripeSubscriptions = await stripe.listSubscriptions(accountId);
    const subscriptions = stripeSubscriptions.map(mapStripeSubscriptionToSubscriptionObject);

    Log("mySubscriptions", subscriptions);

    return subscriptions;
};

export const mySubscriptionsTypeDefs = gql`
    type Query {
        mySubscriptions: [SubscriptionObject] @auth(requires: [user])
    }
`;

export const mySubscriptionsResolvers = { Query: { mySubscriptions } };
