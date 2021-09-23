import { IFieldResolver } from "@graphql-tools/utils";
import { Prefecture } from "@prisma/client";
import { gql } from "apollo-server-core";
import { Context } from "../../context";

type PrefectureByIdArgs = { id: number };

type PrefectureByIdResult = Promise<Prefecture>;

type PrefectureById = IFieldResolver<any, Context, PrefectureByIdArgs, PrefectureByIdResult>;

const prefectureById: PrefectureById = async (_, { id }, { store, dataSources }) => {
    const cacheKey = `prefectures:id:${id}`;
    const cacheDoc = await dataSources.redis.fetch(cacheKey);
    if (cacheDoc) return cacheDoc;
    const prefectureById = await store.prefecture.findUnique({ where: { id } });
    dataSources.redis.store(cacheKey, prefectureById, 600);
    return prefectureById;
};

export const prefectureByIdTypeDefs = gql`
    type Query {
        prefectureById(id: IntID!): Prefecture! @auth(requires: [admin])
    }
`;

export const prefectureByIdResolvers = {
    Query: { prefectureById },
};
