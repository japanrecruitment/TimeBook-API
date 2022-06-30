import { mergeResolvers, mergeTypeDefs } from "@graphql-tools/merge";
import { addHotelResolvers, addHotelTypeDefs } from "./addHotel";
import { hotelObjectResolvers, hotelObjectTypeDefs } from "./HotelObject";
import { hotelNearestStationResolvers, hotelNearestStationTypeDefs } from "./nearest-stations";
import { hotelRoomResolvers, hotelRoomTypeDefs } from "./rooms";

export const typeDefs = mergeTypeDefs([
    addHotelTypeDefs,
    hotelObjectTypeDefs,
    hotelNearestStationTypeDefs,
    hotelRoomTypeDefs,
]);

export const resolvers = mergeResolvers([
    addHotelResolvers,
    hotelObjectResolvers,
    hotelNearestStationResolvers,
    hotelRoomResolvers,
]);
