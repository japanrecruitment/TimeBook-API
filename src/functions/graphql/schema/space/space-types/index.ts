import { mergeResolvers, mergeTypeDefs } from "@graphql-tools/merge";
import { spaceTypeObjectTypeDefs } from "./SpaceTypeObject";
import { addSpaceTypeResolvers, addSpaceTypeTypeDefs } from "./addSpaceType";
import { allSpaceTypesResolvers, allSpaceTypesTypeDefs } from "./allSpaceTypes";
import { removeSpaceTypeResolvers, removeSpaceTypeTypeDefs } from "./removeSpaceType";
import { updateSpaceTypeResolvers, updateSpaceTypeTypeDefs } from "./updateSpaceType";
import { spaceTypeByIdResolvers, spaceTypeByIdTypeDefs } from "./spaceTypeById";
import { enableSpaceTypeResolvers, enableSpaceTypeTypeDefs } from "./enableSpaceType";
import { disableSpaceTypeResolvers, disableSpaceTypeTypeDefs } from "./disableSpaceType";

export const spaceTypesTypeDefs = mergeTypeDefs([
    spaceTypeObjectTypeDefs,
    addSpaceTypeTypeDefs,
    allSpaceTypesTypeDefs,
    removeSpaceTypeTypeDefs,
    updateSpaceTypeTypeDefs,
    spaceTypeByIdTypeDefs,
    enableSpaceTypeTypeDefs,
    disableSpaceTypeTypeDefs,
]);

export const spaceTypesResolvers = mergeResolvers([
    addSpaceTypeResolvers,
    allSpaceTypesResolvers,
    removeSpaceTypeResolvers,
    updateSpaceTypeResolvers,
    spaceTypeByIdResolvers,
    enableSpaceTypeResolvers,
    disableSpaceTypeResolvers,
]);

export * from "./SpaceTypeObject";
