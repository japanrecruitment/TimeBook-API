import { IFieldResolver } from "@graphql-tools/utils";
import { gql } from "apollo-server-core";
import { Context } from "../../context";

type GetCacheDataArgs = { key: string };

type GetCacheDataResult = Promise<String>;

type GetCacheData = IFieldResolver<any, Context, GetCacheDataArgs, GetCacheDataResult>;

const getCacheData: GetCacheData = async (_, { key }, { dataSources }) => {
    const cacheKey = key.replace("cache-data-source:", "");
    const data = await dataSources.redis.fetch(cacheKey);
    return JSON.stringify(data);
};

export const getCacheDataTypeDefs = gql`
    type Query {
        getCacheData(key: String!): String
    }
`;

export const getCacheDataResolvers = {
    Query: { getCacheData },
};
