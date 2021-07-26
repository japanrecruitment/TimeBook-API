import { IFieldResolver } from "@graphql-tools/utils";
import { Station } from "@prisma/client";
import { gql } from "apollo-server-core";
import { Context } from "../../context";
import { GqlError } from "../../error";

type StationsByID = IFieldResolver<any, Context, Record<"id", number>, Promise<Station[]>>;

const stationByID: StationsByID = async (_, { id }, { store, dataSources }) => {
    const cacheDoc = await dataSources.cacheDS.fetchFromCache(`station-${id}`);
    if (cacheDoc) return cacheDoc;
    const station = await store.station.findUnique({ where: { id } });
    if (!station) throw new GqlError({ code: "NOT_FOUND", message: "Couldn't find the station" });
    dataSources.cacheDS.storeInCache(`station-${id}`, station, 600);
    return station;
};

export const stationByIDTypeDefs = gql`
    type Query {
        stationByID(id: IntID!): Station
    }
`;

export const stationByIDResolvers = {
    Query: { stationByID },
};
