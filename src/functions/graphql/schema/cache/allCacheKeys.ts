import { IFieldResolver } from "@graphql-tools/utils";
import { gql } from "apollo-server-core";
import { Context } from "../../context";

type AllCacheKeysResult = Promise<Array<String>>;

type AllCacheKeys = IFieldResolver<any, Context, any, AllCacheKeysResult>;

const allCacheKeys: AllCacheKeys = async (_, __, { dataSources }) => {
    return dataSources.redis.listKeys();
};

export const allCacheKeysTypeDefs = gql`
    type Query {
        allCacheKeys: [String]
    }
`;

export const allCacheKeysResolvers = {
    Query: { allCacheKeys },
};
