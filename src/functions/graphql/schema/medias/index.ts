import { mergeResolvers, mergeTypeDefs } from "@graphql-tools/merge";
import { getUploadTokenResolver, getUploadTokenTypeDefs } from "./getUploadUrl";

export const uploadTokenTypeDefs = mergeTypeDefs([getUploadTokenTypeDefs]);

export const uploadTokenResolvers = mergeResolvers([getUploadTokenResolver]);
