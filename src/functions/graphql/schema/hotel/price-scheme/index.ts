import { mergeResolvers, mergeTypeDefs } from "@graphql-tools/merge";
import { addPriceSchemeResolvers, addPriceSchemeTypeDefs } from "./addPriceScheme";
import { priceSchemeObjectResolvers, priceSchemeObjectTypeDefs } from "./PriceSchemeObject";

export const priceSchemeTypeDefs = mergeTypeDefs([priceSchemeObjectTypeDefs, addPriceSchemeTypeDefs]);

export const priceSchemeResolvers = mergeResolvers([priceSchemeObjectResolvers, addPriceSchemeResolvers]);

export * from "./PriceSchemeObject";
