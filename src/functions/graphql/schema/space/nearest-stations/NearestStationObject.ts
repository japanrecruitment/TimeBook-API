import { Station, NearestStation } from "@prisma/client";
import { gql } from "apollo-server-express";
import { toPrismaSelect } from "@libs/graphql-map-selections";

export type NearestStationObject = Partial<NearestStation> & {
    station?: Partial<Station>;
};

export type NearestStationSelect = {
    station: true;
    via: true;
    time: true;
};

export const toNearestStationSelect = (selection) => {
    const nearestStationSelect = toPrismaSelect<NearestStationSelect>(selection);
    return nearestStationSelect;
};

export const nearestStationObjectTypeDefs = gql`
    type NearestStationObject {
        station: Station
        time: Int
        via: String
    }
`;
