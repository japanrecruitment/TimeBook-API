import { mergeResolvers, mergeTypeDefs } from "@graphql-tools/merge";
import { allSubscriptionProductsResolvers, allSubscriptionProductsTypeDefs } from "./allSubscriptionProducts";
import { cancelSubscriptionResolvers, cancelSubscriptionTypeDefs } from "./cancelSubscription";
import { createSubscriptionResolvers, createSubscriptionTypeDefs } from "./createSubscription";
import { invoiceObjectResolvers, invoiceObjectTypeDefs } from "./InvoiceObject";
import { myInvoicesResolvers, myInvoicesTypeDefs } from "./myInvoices";
import { mySubscriptionsResolvers, mySubscriptionsTypeDefs } from "./mySubscriptions";
import { subscriptionObjectResolvers, subscriptionObjectTypeDefs } from "./SubscriptionObject";
import { subscriptionProductObjectResolvers, subscriptionProductObjectTypeDefs } from "./SubscriptionProductObject";

export const typeDefs = mergeTypeDefs([
    allSubscriptionProductsTypeDefs,
    cancelSubscriptionTypeDefs,
    createSubscriptionTypeDefs,
    invoiceObjectTypeDefs,
    myInvoicesTypeDefs,
    mySubscriptionsTypeDefs,
    subscriptionObjectTypeDefs,
    subscriptionProductObjectTypeDefs,
]);

export const resolvers = mergeResolvers([
    allSubscriptionProductsResolvers,
    cancelSubscriptionResolvers,
    createSubscriptionResolvers,
    invoiceObjectResolvers,
    myInvoicesResolvers,
    mySubscriptionsResolvers,
    subscriptionObjectResolvers,
    subscriptionProductObjectResolvers,
]);
