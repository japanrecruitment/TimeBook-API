import { mergeResolvers, mergeTypeDefs } from "@graphql-tools/merge";
import { environment } from "@utils/environment";
import { allCacheKeysTypeDefs, allCacheKeysResolvers } from "./allCacheKeys";
import { getCacheDataResolvers, getCacheDataTypeDefs } from "./getCacheData";
import { deleteCacheDataTypeDefs, deleteCacheDataResolvers } from "./deleteCacheData";
import { deleteManyCacheDataTypeDefs, deleteManyCacheDataResolvers } from "./deleteManyCacheData";

export const cacheTypeDefs = environment.isDev()
    ? mergeTypeDefs([allCacheKeysTypeDefs, getCacheDataTypeDefs, deleteCacheDataTypeDefs, deleteManyCacheDataTypeDefs])
    : undefined;

export const cacheResolvers = environment.isDev()
    ? mergeResolvers([
          allCacheKeysResolvers,
          getCacheDataResolvers,
          deleteCacheDataResolvers,
          deleteManyCacheDataResolvers,
      ])
    : undefined;
