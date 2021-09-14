import { IFieldResolver } from "@graphql-tools/utils";
import { Station } from "@prisma/client";
import { gql } from "apollo-server-core";
import { Context } from "../../context";

type AllStations = IFieldResolver<any, Context, any, Promise<Station[]>>;

const allStations: AllStations = async (_, __, { store, dataSources }) => {
    const cacheDoc = await dataSources.redis.fetch("all-stations");
    if (cacheDoc) return cacheDoc;
    const allStations = await store.station.findMany({ where: { prefecture: { available: true } } });
    dataSources.redis.store("all-stations", allStations, 600);
    return allStations;
};

export const allStationsTypeDefs = gql`
    type Station {
        id: IntID!
        stationName: String
        stationZipCode: String
        address: String
        longitude: Float
        latitude: Float
    }

    type Query {
        allStations: [Station]
    }
`;

export const allStationsResolvers = {
    Query: { allStations },
};
