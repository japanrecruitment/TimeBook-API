import { mergeResolvers, mergeTypeDefs } from "@graphql-tools/merge";
import { addHotelNearestStationResolvers, addHotelNearestStationTypeDefs } from "./addHotelNearestStation";
import { hotelNearestStationObjectResolvers, hotelNearestStationObjectTypeDefs } from "./HotelNearestStationObject";

export const hotelNearestStationTypeDefs = mergeTypeDefs([
    addHotelNearestStationTypeDefs,
    hotelNearestStationObjectTypeDefs,
]);

export const hotelNearestStationResolvers = mergeResolvers([
    addHotelNearestStationResolvers,
    hotelNearestStationObjectResolvers,
]);

export * from "./addHotelNearestStation";
export * from "./HotelNearestStationObject";
