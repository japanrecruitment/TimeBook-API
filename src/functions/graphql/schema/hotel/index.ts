import { mergeResolvers, mergeTypeDefs } from "@graphql-tools/merge";
import { addHotelResolvers, addHotelTypeDefs } from "./addHotel";
import { allHotelsResolvers, allHotelsTypeDefs } from "./allHotels";
import { basicPriceSettingResolvers, basicPriceSettingTypeDefs } from "./basic-price-setting";
import { hotelByIdResolvers, hotelByIdTypeDefs } from "./hotelById";
import { hotelObjectResolvers, hotelObjectTypeDefs } from "./HotelObject";
import { myHotelsResolvers, myHotelsTypeDefs } from "./myHotels";
import { hotelNearestStationResolvers, hotelNearestStationTypeDefs } from "./nearest-stations";
import { priceSchemeResolvers, priceSchemeTypeDefs } from "./price-scheme";
import { hotelRoomResolvers, hotelRoomTypeDefs } from "./rooms";

export const typeDefs = mergeTypeDefs([
    addHotelTypeDefs,
    allHotelsTypeDefs,
    basicPriceSettingTypeDefs,
    hotelByIdTypeDefs,
    hotelNearestStationTypeDefs,
    hotelObjectTypeDefs,
    hotelRoomTypeDefs,
    myHotelsTypeDefs,
    priceSchemeTypeDefs,
]);

export const resolvers = mergeResolvers([
    addHotelResolvers,
    allHotelsResolvers,
    basicPriceSettingResolvers,
    hotelByIdResolvers,
    hotelNearestStationResolvers,
    hotelObjectResolvers,
    hotelRoomResolvers,
    myHotelsResolvers,
    priceSchemeResolvers,
]);
