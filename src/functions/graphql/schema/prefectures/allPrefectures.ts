import { IFieldResolver } from "@graphql-tools/utils";
import { Prefecture } from "@prisma/client";
import { gql } from "apollo-server-core";
import { Context } from "../../context";

type AllPrefectures = IFieldResolver<any, Context, Record<string, any>, Promise<Prefecture[]>>;

const allPrefectures: AllPrefectures = async (_, __, { store, dataSources }) => {
    const cacheDoc = await dataSources.redis.fetch("prefectures:all");
    if (cacheDoc) return cacheDoc;
    const allPrefectures = await store.prefecture.findMany({ orderBy: { id: "asc" } });
    dataSources.redis.store("prefectures:all", allPrefectures, 600);
    return allPrefectures;
};

export const allPrefecturesTypeDefs = gql`
    type Prefecture {
        id: ID!
        name: String!
        nameKana: String!
        nameRomaji: String
        available: Boolean
    }

    type Query {
        allPrefectures: [Prefecture] @auth(requires: [admin])
    }
`;

export const allPrefecturesResolvers = {
    Query: { allPrefectures },
};
