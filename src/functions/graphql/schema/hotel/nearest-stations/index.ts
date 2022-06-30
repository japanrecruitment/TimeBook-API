import { mergeResolvers, mergeTypeDefs } from "@graphql-tools/merge";
import { addHotelNearestStationTypeDefs } from "./addHotelNearestStation";
import { hotelNearestStationObjectTypeDefs } from "./HotelNearestStationObject";

export const hotelNearestStationTypeDefs = mergeTypeDefs([
    addHotelNearestStationTypeDefs,
    hotelNearestStationObjectTypeDefs,
]);

export const hotelNearestStationResolvers = mergeResolvers([]);

export * from "./addHotelNearestStation";
export * from "./HotelNearestStationObject";
