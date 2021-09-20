import { IFieldResolver } from "@graphql-tools/utils";
import { TrainLine } from "@prisma/client";
import { Log } from "@utils/logger";
import { gql } from "apollo-server-core";
import { Context } from "../../context";

type LinesByPrefecture = IFieldResolver<any, Context, any, Promise<TrainLine[]>>;

const linesByPrefecture: LinesByPrefecture = async (_, { prefectureId }, { store, dataSources }) => {
    const cacheKey = `line:prefecture:${prefectureId}`;
    const cacheDoc = await dataSources.redis.fetch(cacheKey);
    if (cacheDoc) return cacheDoc;

    const lines = (
        await store.station.findMany({
            where: { prefectureCode: prefectureId },
            distinct: ["lineCode"],
            select: { line: true },
        })
    ).map((station) => station.line);

    dataSources.redis.store(cacheKey, lines, 60 * 60 * 24 * 30 * 6); // sec * min * hrs * days * month
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
