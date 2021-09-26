import { IFieldResolver } from "@graphql-tools/utils";
import { gql } from "apollo-server-core";
import { Context } from "../../context";

type DeleteCacheDataArgs = { key: string };

type DeleteCacheDataResult = Promise<String>;

type DeleteCacheData = IFieldResolver<any, Context, DeleteCacheDataArgs, DeleteCacheDataResult>;

const deleteCacheData: DeleteCacheData = async (_, { key }, { dataSources }) => {
    const cacheKey = key.replace("cache-data-source:", "");
    const data = await dataSources.redis.delete(cacheKey);
    return JSON.stringify(data);
};

export const deleteCacheDataTypeDefs = gql`
    type Mutation {
        deleteCacheData(key: String!): String
    }
`;

export const deleteCacheDataResolvers = {
    Mutation: { deleteCacheData },
};
