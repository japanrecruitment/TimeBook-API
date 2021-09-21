import { mergeResolvers, mergeTypeDefs } from "@graphql-tools/merge";
import { MediaResolvers, MediaTypeDefs } from "./media";
export * from "./media";
export * from "./toPhotoSelect";

export const mediaResolvers = mergeResolvers([MediaResolvers]);
export const mediaTypeDefs = mergeTypeDefs([MediaTypeDefs]);
