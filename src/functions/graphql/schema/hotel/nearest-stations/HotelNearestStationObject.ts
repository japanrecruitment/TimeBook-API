import { HotelNearestStation, Station } from "@prisma/client";
import { gql } from "apollo-server-core";
import { toPrismaSelect } from "graphql-map-selections";

export type HotelNearestStationObject = Partial<HotelNearestStation> & {
    station?: Partial<Station>;
};

export type HotelNearestStationSelect = {
    station: boolean;
    via: boolean;
    time: boolean;
    exit: boolean;
};

export function toHotelNearestStationSelect(selection) {
    const nearestStationSelect = toPrismaSelect<HotelNearestStationSelect>(selection);
    return nearestStationSelect;
}

export const hotelNearestStationObjectTypeDefs = gql`
    type HotelNearestStationObject {
        station: Station
        time: Int
        accessType: String
        exit: String
    }
`;

export const hotelNearestStationObjectResolvers = {};
