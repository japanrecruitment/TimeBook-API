import { Station, NearestStation } from "@prisma/client";
import { gql } from "apollo-server-core";
import { toPrismaSelect } from "graphql-map-selections";

export type NearestStationObject = Partial<NearestStation> & {
    station?: Partial<Station>;
};

export type NearestStationSelect = {
    station: boolean;
    via: boolean;
    time: boolean;
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
