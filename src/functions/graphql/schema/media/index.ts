import { mergeResolvers, mergeTypeDefs } from "@graphql-tools/merge";
import { MediaResolvers, MediaTypeDefs } from "./media";

export const mediaResolvers = mergeResolvers([MediaResolvers]);
export const mediaTypeDefs = mergeTypeDefs([MediaTypeDefs]);

export * from "./media";
