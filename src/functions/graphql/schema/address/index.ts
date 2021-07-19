import { mergeResolvers, mergeTypeDefs } from "@graphql-tools/merge";
import { getAddressTypeDefs, getAddressResolver } from "./getAddress";
import { updateAddressResolvers, updateAddressTypeDefs } from "./updateAddress";

export const addressTypeDefs = mergeTypeDefs([getAddressTypeDefs, updateAddressTypeDefs]);

export const addressResolvers = mergeResolvers([getAddressResolver, updateAddressResolvers]);
