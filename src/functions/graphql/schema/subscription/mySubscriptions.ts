import { IFieldResolver } from "@graphql-tools/utils";
import { StripeLib } from "@libs/paymentProvider";
import { Log } from "@utils/logger";
import { gql } from "apollo-server-core";
import { Context } from "../../context";
import { GqlError } from "../../error";
import { SubscriptionObject } from "./SubscriptionObject";

type MySubscriptionsArgs = any;

type MySubscriptionsResult = SubscriptionObject[];

type MySubscriptions = IFieldResolver<any, Context, MySubscriptionsArgs, Promise<MySubscriptionsResult>>;

const mySubscriptions: MySubscriptions = async (_, __, { authData, store }) => {
    const { accountId, id: userId } = authData;
    if (!accountId || !userId) throw new GqlError({ code: "FORBIDDEN", message: "Invalid token!!" });

    const user = await store.user.findUnique({ where: { id: userId }, select: { stripeCustomerId: true } });
    if (!user) throw new GqlError({ code: "BAD_REQUEST", message: "User not found" });
    if (!user.stripeCustomerId) throw new GqlError({ code: "BAD_REQUEST", message: "Stripe account not found" });

    const stripe = new StripeLib();
    const stripeSubscriptions = await stripe.listSubscriptions(accountId);
    const subscriptions = await store.subscription.findMany({
        where: { accountId, stripeSubId: { in: stripeSubscriptions.map(({ id }) => id) } },
    });

    Log("mySubscriptions", subscriptions);

    return subscriptions.map<SubscriptionObject>(({ id, canceledAt, endsAt, isCanceled, stripeSubId }) => {
        const stripeSubscription = stripeSubscriptions.find(({ id }) => id === stripeSubId);
        const stripePrice = stripeSubscription.items.data[0].price;
        const stripeProduct = stripePrice.product;
        return {
            id: id,
            amount: stripePrice.unit_amount,
            canceledAt,
            currentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000),
            currentPeriodStart: new Date(stripeSubscription.current_period_start * 1000),
            endsAt,
            isCanceled,
            name: stripeProduct.metadata.name,
            priceType: stripePrice.metadata.name,
            type: stripeProduct.metadata.type,
            unit: parseInt(stripePrice.product.metadata.unit),
        };
    });
};

export const mySubscriptionsTypeDefs = gql`
    type Query {
        mySubscriptions: [SubscriptionObject] @auth(requires: [user])
    }
`;

export const mySubscriptionsResolvers = { Query: { mySubscriptions } };
