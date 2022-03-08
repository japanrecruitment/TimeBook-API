import { mergeResolvers, mergeTypeDefs } from "@graphql-tools/merge";
import { addPricePlanOverrideResolvers, addPricePlanOverrideTypeDefs } from "./addPricePlanOverride";
import { pricePlanOverrideObjectTypeDefs } from "./PricePlanOverrideObject";
import { removePricePlanOverrideResolvers, removePricePlanOverrideTypeDefs } from "./removePricePlanOverride";
import { updatePricePlanOverrideResolvers, updatePricePlanOverrideTypeDefs } from "./updatePricePlanOverride";

export const pricePlanOverrideTypeDefs = mergeTypeDefs([
    pricePlanOverrideObjectTypeDefs,
    addPricePlanOverrideTypeDefs,
    updatePricePlanOverrideTypeDefs,
    removePricePlanOverrideTypeDefs,
]);

export const pricePlanOverrideResolvers = mergeResolvers([
    addPricePlanOverrideResolvers,
    updatePricePlanOverrideResolvers,
    removePricePlanOverrideResolvers,
]);

export * from "./PricePlanOverrideObject";
