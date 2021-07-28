import { mergeResolvers, mergeTypeDefs } from "@graphql-tools/merge";
import { addSpaceTypeResolvers, addSpaceTypeTypeDefs } from "./addSpaceType";
import { allSpaceTypesResolvers, allSpaceTypesTypeDefs } from "./allSpaceTypes";

export const spaceTypesTypeDefs = mergeTypeDefs([addSpaceTypeTypeDefs, allSpaceTypesTypeDefs]);

export const spaceTypesResolvers = mergeResolvers([addSpaceTypeResolvers, allSpaceTypesResolvers]);
