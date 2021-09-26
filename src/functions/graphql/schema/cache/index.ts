import { mergeResolvers, mergeTypeDefs } from "@graphql-tools/merge";
import { environment } from "@utils/environment";
import { allCacheKeysTypeDefs, allCacheKeysResolvers } from "./allCacheKeys";
import { getCacheDataResolvers, getCacheDataTypeDefs } from "./getCacheData";

export const cacheTypeDefs = environment.isDev()
    ? mergeTypeDefs([allCacheKeysTypeDefs, getCacheDataTypeDefs])
    : undefined;

export const cacheResolvers = environment.isDev()
    ? mergeResolvers([allCacheKeysResolvers, getCacheDataResolvers])
    : undefined;
