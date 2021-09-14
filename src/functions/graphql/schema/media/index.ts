import { mergeResolvers, mergeTypeDefs } from "@graphql-tools/merge";
import { MediaResolvers, MediaTypeDefs } from "./media";
export * from "./media";
export * from "./mapPhotoSelection";

export const mediaResolvers = mergeResolvers([MediaResolvers]);
export const mediaTypeDefs = mergeTypeDefs([MediaTypeDefs]);
