import { mergeResolvers, mergeTypeDefs } from "@graphql-tools/merge";
import { addSpaceAddressResolvers, addSpaceAddressTypeDefs } from "./addSpaceAddress";
import { updateSpaceAddressResolvers, updateSpaceAddressTypeDefs } from "./updateSpaceAddress";

export const spaceAddressTypeDefs = mergeTypeDefs([addSpaceAddressTypeDefs, updateSpaceAddressTypeDefs]);

export const spaceAddressResolvers = mergeResolvers([addSpaceAddressResolvers, updateSpaceAddressResolvers]);
