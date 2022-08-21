import { mergeResolvers, mergeTypeDefs } from "@graphql-tools/merge";
import { allSubscriptionProductsResolvers, allSubscriptionProductsTypeDefs } from "./allSubscriptionProducts";
import { cancelSubscriptionResolvers, cancelSubscriptionTypeDefs } from "./cancelSubscription";
import { createSubscriptionResolvers, createSubscriptionTypeDefs } from "./createSubscription";
import { mySubscriptionsResolvers, mySubscriptionsTypeDefs } from "./mySubscriptions";
import { subscriptionObjectResolvers, subscriptionObjectTypeDefs } from "./SubscriptionObject";
import { subscriptionProductObjectResolvers, subscriptionProductObjectTypeDefs } from "./SubscriptionProductObject";

export const typeDefs = mergeTypeDefs([
    allSubscriptionProductsTypeDefs,
    cancelSubscriptionTypeDefs,
    createSubscriptionTypeDefs,
    mySubscriptionsTypeDefs,
    subscriptionObjectTypeDefs,
    subscriptionProductObjectTypeDefs,
]);

export const resolvers = mergeResolvers([
    allSubscriptionProductsResolvers,
    cancelSubscriptionResolvers,
    createSubscriptionResolvers,
    mySubscriptionsResolvers,
    subscriptionObjectResolvers,
    subscriptionProductObjectResolvers,
]);
