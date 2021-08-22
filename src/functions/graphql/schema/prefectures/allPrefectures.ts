import { IFieldResolver } from "@graphql-tools/utils";
import { Prefecture } from "@prisma/client";
import { gql } from "apollo-server-core";
import { Context } from "../../context";

type AllPrefectures = IFieldResolver<any, Context, Record<string, any>, Promise<Prefecture[]>>;

const allPrefectures: AllPrefectures = async (_, __, { store, dataSources }) => {
    const cacheDoc = await dataSources.redisDS.fetch("all-prefectures");
    if (cacheDoc) return cacheDoc;
    const allPrefectures = await store.prefecture.findMany();
    dataSources.redisDS.store("all-prefectures", allPrefectures, 600);
    return allPrefectures;
};

type Prefectures = IFieldResolver<any, Context, Record<string, any>, Promise<Prefecture[]>>;

const prefectures: Prefectures = async (_, __, { store, dataSources }) => {
    const cacheKey = "available-prefectures";
    const cacheDoc = await dataSources.redisDS.fetch(cacheKey);
    if (cacheDoc) return cacheDoc;
    const allPrefectures = await store.prefecture.findMany({ where: { available: true } });
    dataSources.redisDS.store(cacheKey, allPrefectures, 60 * 60 * 24 * 30 * 6); // sec * min * hrs * days * month
    return allPrefectures;
};

export const allPrefecturesTypeDefs = gql`
    type Prefecture {
        id: IntID!
        name: String!
        nameKana: String!
        nameRomaji: String
        available: Boolean
    }

    type Query {
        allPrefectures: [Prefecture] @auth(requires: [admin])
        prefectures: [Prefecture]
    }
`;

export const allPrefecturesResolvers = {
    Query: { allPrefectures, prefectures },
};
