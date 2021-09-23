import { IFieldResolver } from "@graphql-tools/utils";
import { Prefecture } from "@prisma/client";
import { gql } from "apollo-server-core";
import { Context } from "../../context";

type AvailablePrefectures = IFieldResolver<any, Context, Record<string, any>, Promise<Prefecture[]>>;

const availablePrefectures: AvailablePrefectures = async (_, __, { store, dataSources }) => {
    const cacheKey = "prefectures:available";
    const cacheDoc = await dataSources.redis.fetch(cacheKey);
    if (cacheDoc) return cacheDoc;
    const availablePrefectures = await store.prefecture.findMany({ where: { available: true } });
    dataSources.redis.store(cacheKey, availablePrefectures, 60 * 60 * 24 * 30 * 6); // sec * min * hrs * days * month
    return availablePrefectures;
};

export const availablePrefecturesTypeDefs = gql`
    type Query {
        availablePrefectures: [Prefecture]
    }
`;

export const availablePrefecturesResolvers = {
    Query: { availablePrefectures },
};
