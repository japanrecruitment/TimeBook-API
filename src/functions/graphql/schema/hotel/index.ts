import { mergeResolvers, mergeTypeDefs } from "@graphql-tools/merge";
import { addHotelResolvers, addHotelTypeDefs } from "./addHotel";
import { hotelObjectResolvers, hotelObjectTypeDefs } from "./HotelObject";
import { hotelNearestStationResolvers, hotelNearestStationTypeDefs } from "./nearest-stations";

export const typeDefs = mergeTypeDefs([addHotelTypeDefs, hotelObjectTypeDefs, hotelNearestStationTypeDefs]);

export const resolvers = mergeResolvers([addHotelResolvers, hotelObjectResolvers, hotelNearestStationResolvers]);
