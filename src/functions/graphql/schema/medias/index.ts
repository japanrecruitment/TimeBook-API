import { mergeResolvers, mergeTypeDefs } from "@graphql-tools/merge";
import { getUploadTokenResolver, getUploadTokenTypeDefs } from "./getUploadUrl";
import { PhotoGalleryTypeDefs } from "./photoGallery";

export const uploadTokenTypeDefs = mergeTypeDefs([getUploadTokenTypeDefs, PhotoGalleryTypeDefs]);

export const uploadTokenResolvers = mergeResolvers([getUploadTokenResolver]);
