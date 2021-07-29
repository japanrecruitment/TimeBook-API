import { mergeResolvers, mergeTypeDefs } from "@graphql-tools/merge";
import { addSpaceTypeResolvers, addSpaceTypeTypeDefs } from "./addSpaceType";
import { allSpaceTypesResolvers, allSpaceTypesTypeDefs } from "./allSpaceTypes";
import { updateSpaceTypeResolvers, updateSpaceTypeTypeDefs } from "./updateSpaceType";

export const spaceTypesTypeDefs = mergeTypeDefs([addSpaceTypeTypeDefs, allSpaceTypesTypeDefs, updateSpaceTypeTypeDefs]);

export const spaceTypesResolvers = mergeResolvers([
    addSpaceTypeResolvers,
    allSpaceTypesResolvers,
    updateSpaceTypeResolvers,
]);
