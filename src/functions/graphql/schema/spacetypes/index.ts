import { mergeResolvers, mergeTypeDefs } from "@graphql-tools/merge";
import { addSpaceResolvers, addSpaceTypeDefs } from "../space/addSpace";
import { allSpaceResolvers, allSpaceTypeDefs } from "./allSpaceTypes";

export const spaceTypesTypeDefs = mergeTypeDefs([addSpaceTypeDefs, allSpaceTypeDefs]);

export const spaceTypesResolvers = mergeResolvers([addSpaceResolvers, allSpaceResolvers]);
