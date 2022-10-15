import { mergeResolvers, mergeTypeDefs } from "@graphql-tools/merge";
import { paymentSourceResolvers, paymentSourceTypeDefs } from "./paymentSource";
import { addPaymentMethodResolvers, addPaymentMethodTypeDefs } from "./addPaymentMethod";
import { setupIntentResolvers, setupIntentTypedefs } from "./setupIntent";
import { setDefaultPaymentMethodResolvers, setDefaultPaymentMethodTypeDefs } from "./setDefaultPaymentMethod";
import { removePaymentMethodResolvers, removePaymentMethodTypeDefs } from "./removePaymentMethod";

export const typeDefs = mergeTypeDefs([
    paymentSourceTypeDefs,
    addPaymentMethodTypeDefs,
    setDefaultPaymentMethodTypeDefs,
    setupIntentTypedefs,
    removePaymentMethodTypeDefs,
]);

export const resolvers = mergeResolvers([
    paymentSourceResolvers,
    addPaymentMethodResolvers,
    setDefaultPaymentMethodResolvers,
    setupIntentResolvers,
    removePaymentMethodResolvers,
]);
