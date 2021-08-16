import { Station } from "@prisma/client";
import { gql } from "apollo-server-core";

export type NearestStation = {
    station?: Partial<Station>;
    via?: string;
    time?: number;
};

export type NearestStationsInput = {
    stationId: number;
    via: string;
    time: number;
};

export const nearestStationTypeDefs = gql`
    type NearestStation {
        station: Station
        via: String
        time: Int
    }

    input NearestStationsInput {
        stationId: IntID!
        via: String!
        time: Int!
    }
`;
