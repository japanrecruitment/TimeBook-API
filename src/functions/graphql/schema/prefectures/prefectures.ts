import { IFieldResolver } from "@graphql-tools/utils";
import { Prefecture } from "@prisma/client";
import { gql } from "apollo-server-core";
import { Context } from "../../context";

type Prefectures = IFieldResolver<any, Context, Record<string, any>, Promise<Prefecture[]>>;

const prefectures: Prefectures = async (_, __, { store, dataSources }) => {
    const cacheKey = "available-prefectures";
    const cacheDoc = await dataSources.cacheDS.fetchFromCache(cacheKey);
    if (cacheDoc) return cacheDoc;
    const availablePrefectures = await store.prefecture.findMany({ where: { available: true } });
    dataSources.cacheDS.storeInCache(cacheKey, availablePrefectures, 60 * 60 * 24 * 30 * 6); // sec * min * hrs * days * month
    return availablePrefectures;
};

export const prefecturesTypeDefs = gql`
    type Query {
        prefectures: [Prefecture]
    }
`;

export const prefecturesResolvers = {
    Query: { prefectures },
};
