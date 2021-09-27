import { IFieldResolver } from "@graphql-tools/utils";
import { environment } from "@utils/environment";
import { gql } from "apollo-server-core";
import { Context } from "../../context";

type DeleteManyCacheDataArgs = { key: string };

type DeleteManyCacheDataResult = Promise<String>;

type DeleteManyCacheData = IFieldResolver<any, Context, DeleteManyCacheDataArgs, DeleteManyCacheDataResult>;

const deleteManyCacheData: DeleteManyCacheData = async (_, { key }, { dataSources }) => {
    const cacheKey = key.replace(`${environment.APP_NAME}:`, "");
    const data = await dataSources.redis.deleteMany(cacheKey);
    return JSON.stringify(data);
};

export const deleteManyCacheDataTypeDefs = gql`
    type Mutation {
        deleteManyCacheData(key: String!): String
    }
`;

export const deleteManyCacheDataResolvers = {
    Mutation: { deleteManyCacheData },
};
