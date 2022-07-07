import { mergeResolvers, mergeTypeDefs } from "@graphql-tools/merge";
import { addPriceSchemeResolvers, addPriceSchemeTypeDefs } from "./addPriceScheme";
import { myPriceSchemesResolvers, myPriceSchemesTypeDefs } from "./myPriceSchemes";
import { priceSchemeByIdResolvers, priceSchemeByIdTypeDefs } from "./priceSchemeById";
import { priceSchemeObjectResolvers, priceSchemeObjectTypeDefs } from "./PriceSchemeObject";

export const priceSchemeTypeDefs = mergeTypeDefs([
    priceSchemeObjectTypeDefs,
    addPriceSchemeTypeDefs,
    myPriceSchemesTypeDefs,
    priceSchemeByIdTypeDefs,
]);

export const priceSchemeResolvers = mergeResolvers([
    priceSchemeObjectResolvers,
    addPriceSchemeResolvers,
    myPriceSchemesResolvers,
    priceSchemeByIdResolvers,
]);

export * from "./PriceSchemeObject";
