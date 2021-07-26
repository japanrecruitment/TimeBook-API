import { mergeResolvers, mergeTypeDefs } from "@graphql-tools/merge";
import { addSpaceResolvers, addSpaceTypeDefs } from "./addSpace";

export const spaceTypeDefs = mergeTypeDefs([addSpaceTypeDefs]);

export const spaceResolvers = mergeResolvers([addSpaceResolvers]);
