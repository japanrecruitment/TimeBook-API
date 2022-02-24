import { mergeResolvers, mergeTypeDefs } from "@graphql-tools/merge";
import { spacePricePlanObjectTypeDefs } from "./SpacePricePlanObject";
import { updateSpacePricePlanResolvers, updateSpacePricePlanTypeDefs } from "./updateSpacePricePlan";
import { removeSpacePricePlanResolvers, removeSpacePricePlanTypeDefs } from "./removeSpacePricePlan";
import { addDefaultPriceResolvers, addDefaultPriceTypeDefs } from "./addDefaultPrice";
import { pricePlanBySpaceIdResolvers, pricePlanBySpaceIdTypeDefs } from "./pricePlansBySpaceId";
import { pricePlanFilterOptionsTypeDefs } from "./PricePlanFilterOptions";
import { addPricePlanResolvers, addPricePlanTypeDefs } from "./addPricePlan";
import { pricePlanOverrideResolvers, pricePlanOverrideTypeDefs } from "./price-plan-override";

export const spacePricePlanTypeDefs = mergeTypeDefs([
    spacePricePlanObjectTypeDefs,
    addDefaultPriceTypeDefs,
    pricePlanFilterOptionsTypeDefs,
    pricePlanBySpaceIdTypeDefs,
    updateSpacePricePlanTypeDefs,
    removeSpacePricePlanTypeDefs,
    addPricePlanTypeDefs,
    pricePlanOverrideTypeDefs,
]);

export const spacePricePlanResolvers = mergeResolvers([
    addDefaultPriceResolvers,
    pricePlanBySpaceIdResolvers,
    updateSpacePricePlanResolvers,
    removeSpacePricePlanResolvers,
    addPricePlanResolvers,
    pricePlanOverrideResolvers,
]);

export * from "./SpacePricePlanObject";
