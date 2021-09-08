import { mergeResolvers, mergeTypeDefs } from "@graphql-tools/merge";
import { uploadImageTypeDefs, uploadImageResolvers } from "./addMedia";

export const mediaTypeDefs = mergeTypeDefs([uploadImageTypeDefs]);

export const mediaResolvers = mergeResolvers([uploadImageResolvers]);
