import { mergeResolvers, mergeTypeDefs } from "@graphql-tools/merge";
import { paymentSourceResolvers, paymentSourceTypeDefs } from "./paymentSource";
import { addPaymentMethodResolvers, addPaymentMethodTypeDefs } from "./addPaymentMethod";
import { setupIntentResolvers, setupIntentTypedefs } from "./setupIntent";

export const typeDefs = mergeTypeDefs([paymentSourceTypeDefs, addPaymentMethodTypeDefs, setupIntentTypedefs]);

export const resolvers = mergeResolvers([paymentSourceResolvers, addPaymentMethodResolvers, setupIntentResolvers]);
