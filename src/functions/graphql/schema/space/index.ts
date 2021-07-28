import { mergeResolvers, mergeTypeDefs } from "@graphql-tools/merge";
import { addSpaceResolvers, addSpaceTypeDefs } from "./addSpace";
import { allSpacesTypeDefs, allSpacesResolvers } from "./allSpaces";
import { mySpacesResolvers, mySpacesTypeDefs } from "./mySpaces";

export const spaceTypeDefs = mergeTypeDefs([addSpaceTypeDefs, allSpacesTypeDefs, mySpacesTypeDefs]);

export const spaceResolvers = mergeResolvers([addSpaceResolvers, allSpacesResolvers, mySpacesResolvers]);
