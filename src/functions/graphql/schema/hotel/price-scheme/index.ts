import { mergeResolvers, mergeTypeDefs } from "@graphql-tools/merge";
import { addPriceSchemeResolvers, addPriceSchemeTypeDefs } from "./addPriceScheme";
import { myPriceSchemesResolvers, myPriceSchemesTypeDefs } from "./myPriceSchemes";
import { priceSchemeByIdResolvers, priceSchemeByIdTypeDefs } from "./priceSchemeById";
import { priceSchemeObjectResolvers, priceSchemeObjectTypeDefs } from "./PriceSchemeObject";
import { updatePriceSchemeResolvers, updatePriceSchemeTypeDefs } from "./updatePriceScheme";

export const priceSchemeTypeDefs = mergeTypeDefs([
    addPriceSchemeTypeDefs,
    myPriceSchemesTypeDefs,
    priceSchemeByIdTypeDefs,
    priceSchemeObjectTypeDefs,
    updatePriceSchemeTypeDefs,
]);

export const priceSchemeResolvers = mergeResolvers([
    addPriceSchemeResolvers,
    myPriceSchemesResolvers,
    priceSchemeByIdResolvers,
    priceSchemeObjectResolvers,
    updatePriceSchemeResolvers,
]);

export * from "./PriceSchemeObject";
