import { mergeResolvers, mergeTypeDefs } from "@graphql-tools/merge";
import { MediaResolvers, MediaTypeDefs } from "./media";

export { ImageTypes } from "./media";

export const mediaResolvers = mergeResolvers([MediaResolvers]);
export const mediaTypeDefs = mergeTypeDefs([MediaTypeDefs]);
