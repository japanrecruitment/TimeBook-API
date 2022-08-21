import { IFieldResolver } from "@graphql-tools/utils";
import { Log } from "@utils/logger";
import { gql } from "apollo-server-core";
import { mapSelections } from "graphql-map-selections";
import { Context } from "../../context";
import { SubscriptionObject, toSubscriptionSelect } from "./SubscriptionObject";

type MySubscriptionsArgs = any;

type MySubscriptionsResult = SubscriptionObject[];

type MySubscriptions = IFieldResolver<any, Context, MySubscriptionsArgs, Promise<MySubscriptionsResult>>;

const mySubscriptions: MySubscriptions = async (_, __, { authData, store }, info) => {
    const { accountId } = authData;

    const subscriptionSelect = toSubscriptionSelect(mapSelections(info))?.select;
    const subscriptions = await store.subscription.findMany({
        where: {
            accountId,
            isCanceled: false,
        },
        select: subscriptionSelect,
    });

    Log("mySubscriptions", subscriptions);

    return subscriptions;
};

export const mySubscriptionsTypeDefs = gql`
    type Query {
        mySubscriptions: [SubscriptionObject] @auth(requires: [user, host])
    }
`;

export const mySubscriptionsResolvers = { Query: { mySubscriptions } };
