import { IFieldResolver } from "@graphql-tools/utils";
import { Station } from "@prisma/client";
import { Log } from "@utils/logger";
import { gql } from "apollo-server-core";
import { Context } from "../../context";

type StationsByLine = IFieldResolver<any, Context, any, Promise<Station[]>>;

const stationsByLine: StationsByLine = async (_, { lineId }, { store, dataSources }) => {
    const cacheKey = `stations-by-line-${lineId}`;
    const cacheDoc = await dataSources.redisDS.fetch(cacheKey);
    Log(cacheDoc);
    if (cacheDoc) return cacheDoc;

    const lines = await store.station.findMany({
        where: {
            lineCode: lineId,
        },
        orderBy: { order: "asc" },
    });

    Log(lines);
    dataSources.redisDS.store(cacheKey, lines, 60 * 60 * 24 * 30 * 6); // sec * min * hrs * days * month
    return lines;
};

export const stationsByLineTypeDefs = gql`
    type Query {
        stationsByLine(lineId: Int!): [Station]
    }
`;

export const stationsByLineResolvers = {
    Query: { stationsByLine },
};
