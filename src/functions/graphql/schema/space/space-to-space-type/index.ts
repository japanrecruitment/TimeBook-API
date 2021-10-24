import { mergeResolvers, mergeTypeDefs } from "@graphql-tools/merge";
import { updateTypesInSpaceResolvers, updateTypesInSpaceTypeDefs } from "./updateTypesInSpace";

export const spaceToSpaceTypeTypeDefs = mergeTypeDefs([updateTypesInSpaceTypeDefs]);

export const spaceToSpaceTypeResolvers = mergeResolvers([updateTypesInSpaceResolvers]);

export * from "./SpaceToSpaceTypeObject";
