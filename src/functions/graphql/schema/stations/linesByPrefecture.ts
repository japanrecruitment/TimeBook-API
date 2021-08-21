import { IFieldResolver } from "@graphql-tools/utils";
import { TrainLine } from "@prisma/client";
import { Log } from "@utils/logger";
import { gql } from "apollo-server-core";
import { Context } from "../../context";

type LinesByPrefecture = IFieldResolver<any, Context, any, Promise<TrainLine[]>>;

const linesByPrefecture: LinesByPrefecture = async (_, { prefectureId }, { store, dataSources }) => {
    const cacheKey = `lines-by-prefecture-${prefectureId}`;
    const cacheDoc = await dataSources.redisDS.fetchFromCache(cacheKey);
    if (cacheDoc) return cacheDoc;

    // TODO: Two queries below needs to be optimized to use functions in postgresql

    const allLineIdsByPrefecture = await store.station.groupBy({
        by: ["lineCode"],
        where: { prefectureCode: prefectureId },
    });

    const lines = await store.trainLine.findMany({
        where: {
            id: { in: allLineIdsByPrefecture.map(({ lineCode }) => lineCode) },
        },
        include: { stations: true },
    });

    dataSources.redisDS.storeInCache(cacheKey, lines, 60 * 60 * 24 * 30 * 6); // sec * min * hrs * days * month
    return lines;
};

export const linesByPrefectureTypeDefs = gql`
    type Query {
        linesByPrefecture(prefectureId: Int!): [Line]
    }
`;

export const linesByPrefectureResolvers = {
    Query: { linesByPrefecture },
};
