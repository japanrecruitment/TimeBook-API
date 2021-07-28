import { mergeResolvers, mergeTypeDefs } from "@graphql-tools/merge";
import { addSpaceTypeResolvers, addSpaceTypeTypeDefs } from "./addSpaceType";
import { allSpaceResolvers, allSpaceTypeDefs } from "./allSpaceTypes";

export const spaceTypesTypeDefs = mergeTypeDefs([addSpaceTypeTypeDefs, allSpaceTypeDefs]);

export const spaceTypesResolvers = mergeResolvers([addSpaceTypeResolvers, allSpaceResolvers]);
