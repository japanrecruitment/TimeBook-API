import { PrismaSelect } from "@libs/prisma-select";
import { Station, NearestStation } from "@prisma/client";
import { gql } from "apollo-server-express";
import { toPrismaSelect } from "graphql-map-selections";

export type NearestStationObject = Partial<NearestStation> & {
    station?: Partial<Station>;
};

export type NearestStationSelect = {
    station: true;
    via: true;
    time: true;
};

export const toNearestStationSelect = (selection): PrismaSelect<NearestStationSelect> => {
    const nearestStationSelect = toPrismaSelect(selection);
    return nearestStationSelect as PrismaSelect<NearestStationSelect>;
};

export const nearestStationObjectTypeDefs = gql`
    type NearestStationObject {
        station: Station
        time: Int
        via: String
    }
`;
