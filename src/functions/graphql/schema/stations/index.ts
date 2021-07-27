import { mergeResolvers, mergeTypeDefs } from "@graphql-tools/merge";
import { allLinesResolvers, allLinesTypeDefs } from "./allLines";
import { allStationsResolvers, allStationsTypeDefs } from "./allStations";
import { lineByIDResolvers, lineByIDTypeDefs } from "./lineByID";
import { stationByIDResolvers, stationByIDTypeDefs } from "./stationByID";

export const stationsTypeDefs = mergeTypeDefs([
    allLinesTypeDefs,
    allStationsTypeDefs,
    lineByIDTypeDefs,
    stationByIDTypeDefs,
]);

export const stationsResolvers = mergeResolvers([
    allLinesResolvers,
    allStationsResolvers,
    lineByIDResolvers,
    stationByIDResolvers,
]);
