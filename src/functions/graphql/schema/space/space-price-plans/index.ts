import { mergeResolvers, mergeTypeDefs } from "@graphql-tools/merge";
import { spacePricePlanObjectTypeDefs } from "./SpacePricePlanObject";
import { addSpacePricePlansResolvers, addSpacePricePlansTypeDefs } from "./addSpacePricePlan";
import { updateSpacePricePlanResolvers, updateSpacePricePlanTypeDefs } from "./updateSpacePricePlan";
import { removeSpacePricePlanResolvers, removeSpacePricePlanTypeDefs } from "./removeSpacePricePlan";

export const spacePricePlanTypeDefs = mergeTypeDefs([
    spacePricePlanObjectTypeDefs,
    addSpacePricePlansTypeDefs,
    updateSpacePricePlanTypeDefs,
    removeSpacePricePlanTypeDefs,
]);

export const spacePricePlanResolvers = mergeResolvers([
    addSpacePricePlansResolvers,
    updateSpacePricePlanResolvers,
    removeSpacePricePlanResolvers,
]);

export * from "./SpacePricePlanObject";
