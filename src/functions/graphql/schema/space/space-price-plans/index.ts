import { mergeResolvers, mergeTypeDefs } from "@graphql-tools/merge";
import { spacePricePlanObjectTypeDefs } from "./SpacePricePlanObject";
import { updateSpacePricePlanResolvers, updateSpacePricePlanTypeDefs } from "./updateSpacePricePlan";
import { removeSpacePricePlanResolvers, removeSpacePricePlanTypeDefs } from "./removeSpacePricePlan";
import { addDefaultSpacePricePlansResolvers, addDefaultSpacePricePlansTypeDefs } from "./addDefaultSpacePricePlan";
import { addSpacePricePlanResolvers, addSpacePricePlanTypeDefs } from "./addSpacePricePlan";

export const spacePricePlanTypeDefs = mergeTypeDefs([
    spacePricePlanObjectTypeDefs,
    addDefaultSpacePricePlansTypeDefs,
    addSpacePricePlanTypeDefs,
    updateSpacePricePlanTypeDefs,
    removeSpacePricePlanTypeDefs,
]);

export const spacePricePlanResolvers = mergeResolvers([
    addDefaultSpacePricePlansResolvers,
    addSpacePricePlanResolvers,
    updateSpacePricePlanResolvers,
    removeSpacePricePlanResolvers,
]);

export * from "./SpacePricePlanObject";
