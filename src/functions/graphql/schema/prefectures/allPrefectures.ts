import { IFieldResolver } from "@graphql-tools/utils";
import { Prefecture } from "@prisma/client";
import { gql } from "apollo-server-core";
import { Context } from "../../context";

type AllPrefectures = IFieldResolver<any, Context, Record<string, any>, Promise<Prefecture[]>>;

const allPrefectures: AllPrefectures = async (_, __, { store, dataSources }) => {
    const cacheDoc = await dataSources.cacheDS.fetchFromCache("all-prefectures");
    if (cacheDoc) return cacheDoc;
    const allPrefectures = await store.prefecture.findMany({ where: { available: true } });
    dataSources.cacheDS.storeInCache("all-prefectures", allPrefectures, 600);
    return allPrefectures;
};

export const allPrefecturesTypeDefs = gql`
    type Prefecture {
        id: IntID!
        name: String!
        nameKana: String!
        nnameRomaji: String
        available: Boolean
    }

    type Query {
        allPrefectures: [Prefecture]
    }
`;

export const allPrefecturesResolvers = {
    Query: { allPrefectures },
};
