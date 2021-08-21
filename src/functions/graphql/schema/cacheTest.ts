import { IFieldResolver } from "@graphql-tools/utils";
import { gql } from "apollo-server-core";
import { Context } from "../context";

type CacheKeys = IFieldResolver<any, Context, Record<"pattern", string>, Promise<Array<string>>>;

const cacheKeys: CacheKeys = async (_, { pattern }, { dataSources }) => {
    return await dataSources.cacheDS.listKeys(pattern);
};

type DeleteManyFromCache = IFieldResolver<any, Context, Record<"pattern", string>, Promise<string>>;

const deleteManyFromCache: DeleteManyFromCache = async (_, { pattern }, { dataSources }) => {
    await dataSources.cacheDS.deleteMany(pattern);
    return "Deleted";
};

export const cacheTestTypeDefs = gql`
    type Query {
        cacheKeys(pattern: String): [String]
    }
    type Mutation {
        deleteManyFromCache(pattern: String): String
    }
`;

export const cacheTestResolvers = {
    Query: { cacheKeys },
    Mutation: { deleteManyFromCache },
};
