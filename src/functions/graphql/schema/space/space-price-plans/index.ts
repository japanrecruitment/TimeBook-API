import { mergeResolvers, mergeTypeDefs } from "@graphql-tools/merge";
import { spacePricePlanObjectTypeDefs } from "./SpacePricePlanObject";
import { addSpacePricePlanResolvers, addSpacePricePlanTypeDefs } from "./addSpacePricePlan";
import { updateSpacePricePlanResolvers, updateSpacePricePlanTypeDefs } from "./updateSpacePricePlan";
import { removeSpacePricePlanResolvers, removeSpacePricePlanTypeDefs } from "./removeSpacePricePlan";

export const spacePricePlanTypeDefs = mergeTypeDefs([
    spacePricePlanObjectTypeDefs,
    addSpacePricePlanTypeDefs,
    updateSpacePricePlanTypeDefs,
    removeSpacePricePlanTypeDefs,
]);

export const spacePricePlanResolvers = mergeResolvers([
    addSpacePricePlanResolvers,
    updateSpacePricePlanResolvers,
    removeSpacePricePlanResolvers,
]);

export * from "./SpacePricePlanObject";
