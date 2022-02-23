import { mergeResolvers, mergeTypeDefs } from "@graphql-tools/merge";
import { spacePricePlanObjectTypeDefs } from "./SpacePricePlanObject";
import { updateSpacePricePlanResolvers, updateSpacePricePlanTypeDefs } from "./updateSpacePricePlan";
import { removeSpacePricePlanResolvers, removeSpacePricePlanTypeDefs } from "./removeSpacePricePlan";
import { addDefaultSpacePricePlansResolvers, addDefaultSpacePricePlansTypeDefs } from "./addDefaultSpacePricePlan";
import { overrideSpacePricePlansResolvers, overrideSpacePricePlansTypeDefs } from "./overrideSpacePricePlans";
import { pricePlanBySpaceIdResolvers, pricePlanBySpaceIdTypeDefs } from "./pricePlansBySpaceId";
import { pricePlanFilterOptionsTypeDefs } from "./PricePlanFilterOptions";

export const spacePricePlanTypeDefs = mergeTypeDefs([
    spacePricePlanObjectTypeDefs,
    addDefaultSpacePricePlansTypeDefs,
    overrideSpacePricePlansTypeDefs,
    pricePlanFilterOptionsTypeDefs,
    pricePlanBySpaceIdTypeDefs,
    updateSpacePricePlanTypeDefs,
    removeSpacePricePlanTypeDefs,
]);

export const spacePricePlanResolvers = mergeResolvers([
    addDefaultSpacePricePlansResolvers,
    overrideSpacePricePlansResolvers,
    pricePlanBySpaceIdResolvers,
    updateSpacePricePlanResolvers,
    removeSpacePricePlanResolvers,
]);

export * from "./SpacePricePlanObject";
