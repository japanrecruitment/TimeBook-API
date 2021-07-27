import { mergeResolvers, mergeTypeDefs } from "@graphql-tools/merge";
import { addSpaceResolvers, addSpaceTypeDefs } from "./addSpace";
import { mySpacesResolvers, mySpacesTypeDefs } from "./getMySpaces";

export const spaceTypeDefs = mergeTypeDefs([addSpaceTypeDefs, mySpacesTypeDefs]);

export const spaceResolvers = mergeResolvers([addSpaceResolvers, mySpacesResolvers]);
