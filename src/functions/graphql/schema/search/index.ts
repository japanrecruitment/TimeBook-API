import { mergeResolvers, mergeTypeDefs } from "@graphql-tools/merge";
import { getSearchAreaResolvers, getSearchAreaTypeDefs } from "./getSearchArea";

export const searchAreaTypeDefs = mergeTypeDefs([getSearchAreaTypeDefs]);

export const searchAreaResolvers = mergeResolvers([getSearchAreaResolvers]);
