import { mergeResolvers, mergeTypeDefs } from "@graphql-tools/merge";
import { spaceTypeObjectTypeDefs } from "./SpaceTypeObject";
import { addSpaceTypeResolvers, addSpaceTypeTypeDefs } from "./addSpaceType";
import { allSpaceTypesResolvers, allSpaceTypesTypeDefs } from "./allSpaceTypes";
import { removeSpaceTypeResolvers, removeSpaceTypeTypeDefs } from "./removeSpaceType";
import { updateSpaceTypeResolvers, updateSpaceTypeTypeDefs } from "./updateSpaceType";
import { spaceTypeByIdResolvers, spaceTypeByIdTypeDefs } from "./spaceTypeById";
import { availableSpaceTypesResolvers, availableSpaceTypesTypeDefs } from "./availableSpaceTypes";
import { updateSpaceTypePhotoTypeDefs, updateSpaceTypePhotoResolvers } from "./updateSpaceTypePhoto";

export const spaceTypesTypeDefs = mergeTypeDefs([
    spaceTypeObjectTypeDefs,
    addSpaceTypeTypeDefs,
    allSpaceTypesTypeDefs,
    removeSpaceTypeTypeDefs,
    updateSpaceTypeTypeDefs,
    spaceTypeByIdTypeDefs,
    availableSpaceTypesTypeDefs,
    updateSpaceTypePhotoTypeDefs,
]);

export const spaceTypesResolvers = mergeResolvers([
    addSpaceTypeResolvers,
    allSpaceTypesResolvers,
    removeSpaceTypeResolvers,
    updateSpaceTypeResolvers,
    spaceTypeByIdResolvers,
    availableSpaceTypesResolvers,
    updateSpaceTypePhotoResolvers,
]);

export * from "./SpaceTypeObject";
