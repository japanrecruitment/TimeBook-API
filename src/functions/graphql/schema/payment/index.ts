import { mergeResolvers, mergeTypeDefs } from "@graphql-tools/merge";
import { paymentProviderResolver, paymentProviderTypeDef } from "./PaymentProvider";
import { paymentSourceTypeDefs, paymentSourceResolvers } from "./paymentSource";

export const typeDefs = mergeTypeDefs([paymentProviderTypeDef, paymentSourceTypeDefs]);

export const resolvers = mergeResolvers([paymentProviderResolver, paymentSourceResolvers]);
