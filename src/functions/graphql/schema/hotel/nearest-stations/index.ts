import { mergeResolvers, mergeTypeDefs } from "@graphql-tools/merge";
import { addHotelNearestStationResolvers, addHotelNearestStationTypeDefs } from "./addHotelNearestStation";
import { hotelNearestStationObjectResolvers, hotelNearestStationObjectTypeDefs } from "./HotelNearestStationObject";
import { removeHotelNearestStationResolvers, removeHotelNearestStationTypeDefs } from "./removeHotelNearestStation";
import { updateHotelNearestStationResolvers, updateHotelNearestStationTypeDefs } from "./updateNearestStation";

export const hotelNearestStationTypeDefs = mergeTypeDefs([
    addHotelNearestStationTypeDefs,
    hotelNearestStationObjectTypeDefs,
    removeHotelNearestStationTypeDefs,
    updateHotelNearestStationTypeDefs,
]);

export const hotelNearestStationResolvers = mergeResolvers([
    addHotelNearestStationResolvers,
    hotelNearestStationObjectResolvers,
    removeHotelNearestStationResolvers,
    updateHotelNearestStationResolvers,
]);

export * from "./addHotelNearestStation";
export * from "./HotelNearestStationObject";
