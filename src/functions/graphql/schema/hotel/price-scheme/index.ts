import { mergeResolvers, mergeTypeDefs } from "@graphql-tools/merge";
import { priceSchemeObjectResolvers, priceSchemeObjectTypeDefs } from "./PriceSchemeObject";

export const typeDefs = mergeTypeDefs([priceSchemeObjectTypeDefs]);

export const resolvers = mergeResolvers([priceSchemeObjectResolvers]);

export * from "./PriceSchemeObject";
