import { IFieldResolver } from "@graphql-tools/utils";
import { gql } from "apollo-server-core";
import { Context } from "../context";

type CacheKeys = IFieldResolver<any, Context, Record<"pattern", string>, Promise<Array<string>>>;

const cacheKeys: CacheKeys = async (_, { pattern }, { dataSources }) => {
    return await dataSources.redisDS.listKeys(pattern);
};

type DeleteManyFromCache = IFieldResolver<any, Context, Record<"pattern", string>, Promise<string>>;

const deleteManyFromCache: DeleteManyFromCache = async (_, { pattern }, { dataSources }) => {
    await dataSources.redisDS.deleteMany(pattern);
    return "Deleted";
};

type StoreInCache = IFieldResolver<any, Context, { key: string; value: string; ttl: number }, Promise<string>>;

const storeInCache: StoreInCache = async (_, { key, value, ttl }, { dataSources }) => {
    await dataSources.redisDS.storeInCache(key, value, ttl);
    return "Saved";
};

export const cacheTestTypeDefs = gql`
    type Query {
        cacheKeys(pattern: String): [String]
    }
    type Mutation {
        storeInCache(key: String!, value: String!, ttl: Int): String
        deleteManyFromCache(pattern: String): String
    }
`;

export const cacheTestResolvers = {
    Query: { cacheKeys },
    Mutation: { deleteManyFromCache, storeInCache },
};
