import { gql } from "apollo-server-lambda";

// || @auth(requires: admin)

export default gql`
    type Station {
        id: ID!
        stationName: String
        stationZipCode: String
        address: String
        longitude: Float
        latitude: Float
    }

    type Line {
        id: ID!
        name: String
        nameKana: String
        nameOfficial: String
        colorCode: String
        longitude: Float
        latitude: Float
        zoom: Int

        stations: [Station]
    }

    extend type Query {
        getStationById(stationId: ID!): Station!
        getAllStations: [Station]
        getLineById(lineId: ID!): Line!
        getAllLines: [Line]
    }
`;
