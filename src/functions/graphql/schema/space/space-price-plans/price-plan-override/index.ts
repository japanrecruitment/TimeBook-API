import { mergeResolvers, mergeTypeDefs } from "@graphql-tools/merge";
import { addPricePlanOverrideResolvers, addPricePlanOverrideTypeDefs } from "./addPricePlanOverride";
import { pricePlanOverrideObjectTypeDefs } from "./PricePlanOverrideObject";

export const pricePlanOverrideTypeDefs = mergeTypeDefs([pricePlanOverrideObjectTypeDefs, addPricePlanOverrideTypeDefs]);

export const pricePlanOverrideResolvers = mergeResolvers([addPricePlanOverrideResolvers]);

export * from "./PricePlanOverrideObject";
