import { mergeResolvers, mergeTypeDefs } from "@graphql-tools/merge";
import { spaceTypeObjectTypeDefs } from "./SpaceTypeObject";
import { addSpaceTypeResolvers, addSpaceTypeTypeDefs } from "./addSpaceType";
import { allSpaceTypesResolvers, allSpaceTypesTypeDefs } from "./allSpaceTypes";
import { removeSpaceTypeResolvers, removeSpaceTypeTypeDefs } from "./removeSpaceType";
import { updateSpaceTypeResolvers, updateSpaceTypeTypeDefs } from "./updateSpaceType";

export const spaceTypesTypeDefs = mergeTypeDefs([
    spaceTypeObjectTypeDefs,
    addSpaceTypeTypeDefs,
    allSpaceTypesTypeDefs,
    removeSpaceTypeTypeDefs,
    updateSpaceTypeTypeDefs,
]);

export const spaceTypesResolvers = mergeResolvers([
    addSpaceTypeResolvers,
    allSpaceTypesResolvers,
    removeSpaceTypeResolvers,
    updateSpaceTypeResolvers,
]);

export * from "./SpaceTypeObject";
export * from "./addSpaceType";
export * from "./allSpaceTypes";
export * from "./removeSpaceType";
export * from "./updateSpaceType";
