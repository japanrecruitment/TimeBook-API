import { mergeResolvers, mergeTypeDefs } from "@graphql-tools/merge";
import { addHotelResolvers, addHotelTypeDefs } from "./addHotel";
import { allHotelsResolvers, allHotelsTypeDefs } from "./allHotels";
import { hotelByIdResolvers, hotelByIdTypeDefs } from "./hotelById";
import { hotelObjectResolvers, hotelObjectTypeDefs } from "./HotelObject";
import { myHotelsResolvers, myHotelsTypeDefs } from "./myHotels";
import { hotelNearestStationResolvers, hotelNearestStationTypeDefs } from "./nearest-stations";
import { priceSchemeResolvers, priceSchemeTypeDefs } from "./price-scheme";
import { hotelRoomResolvers, hotelRoomTypeDefs } from "./rooms";

export const typeDefs = mergeTypeDefs([
    addHotelTypeDefs,
    hotelObjectTypeDefs,
    allHotelsTypeDefs,
    myHotelsTypeDefs,
    hotelByIdTypeDefs,
    hotelNearestStationTypeDefs,
    hotelRoomTypeDefs,
    priceSchemeTypeDefs,
]);

export const resolvers = mergeResolvers([
    addHotelResolvers,
    hotelObjectResolvers,
    allHotelsResolvers,
    myHotelsResolvers,
    hotelByIdResolvers,
    hotelNearestStationResolvers,
    hotelRoomResolvers,
    priceSchemeResolvers,
]);
