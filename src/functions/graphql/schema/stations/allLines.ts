import { IFieldResolver } from "@graphql-tools/utils";
import { TrainLine } from "@prisma/client";
import { gql } from "apollo-server-core";
import { Context } from "../../context";

type AllLines = IFieldResolver<any, Context, any, Promise<TrainLine[]>>;
type LinesByPrefecture = IFieldResolver<any, Context, any, Promise<TrainLine[]>>;

const allLines: AllLines = async (_, __, { store, dataSources }) => {
    const cacheDoc = await dataSources.redisDS.fetch("all-lines");
    if (cacheDoc) return cacheDoc;
    const allStations = await store.trainLine.findMany({ where: { status: 0 }, include: { stations: true } });
    dataSources.redisDS.store("all-lines", allStations, 600);
    return allStations;
};
const linesByPrefecture: LinesByPrefecture = async (_, __, { store, dataSources }) => {
    const cacheDoc = await dataSources.redisDS.fetch("lines-");
    if (cacheDoc) return cacheDoc;
    const allStations = await store.trainLine.findMany({ where: { status: 0 }, include: { stations: true } });
    dataSources.redisDS.store("all-lines", allStations, 600);
    return allStations;
};

export const allLinesTypeDefs = gql`
    type Line {
        id: IntID!
        name: String
        nameKana: String
        nameOfficial: String
        colorCode: String
        longitude: Float
        latitude: Float
        zoom: Int
        stations: [Station]
    }

    type Query {
        allLines: [Line] @auth(requires: [admin])
        linesByPrefecture: [Line]
    }
`;

export const allLinesResolvers = {
    Query: { allLines, linesByPrefecture },
};
