import { mergeResolvers, mergeTypeDefs } from "@graphql-tools/merge";
import { addHotelResolvers, addHotelTypeDefs } from "./addHotel";
import { addHotelPhotosResolvers, addHotelPhotosTypeDefs } from "./addHotelPhotos";
import { allHotelsResolvers, allHotelsTypeDefs } from "./allHotels";
import { basicPriceSettingResolvers, basicPriceSettingTypeDefs } from "./basic-price-setting";
import { hotelByIdResolvers, hotelByIdTypeDefs } from "./hotelById";
import { hotelNearestStationResolvers, hotelNearestStationTypeDefs } from "./nearest-stations";
import { hotelObjectResolvers, hotelObjectTypeDefs } from "./HotelObject";
import { hotelRoomResolvers, hotelRoomTypeDefs } from "./rooms";
import { myHotelsResolvers, myHotelsTypeDefs } from "./myHotels";
import { packagePlanResolvers, packagePlanTypeDefs } from "./package-plan";
import { priceSchemeResolvers, priceSchemeTypeDefs } from "./price-scheme";
import { removeHotelPhotoResolvers, removeHotelPhotoTypeDefs } from "./removeHotelPhoto";
import { updateHotelAddressResolvers, updateHotelAddressTypeDefs } from "./updateHotelAddress";
import { updateHotelResolvers, updateHotelTypeDefs } from "./updateHotel";
import { priceOverrideResolvers, priceOverrideTypeDefs } from "./price-override";

export const typeDefs = mergeTypeDefs([
    addHotelPhotosTypeDefs,
    addHotelTypeDefs,
    allHotelsTypeDefs,
    basicPriceSettingTypeDefs,
    hotelByIdTypeDefs,
    hotelNearestStationTypeDefs,
    hotelObjectTypeDefs,
    hotelRoomTypeDefs,
    myHotelsTypeDefs,
    packagePlanTypeDefs,
    priceOverrideTypeDefs,
    priceSchemeTypeDefs,
    removeHotelPhotoTypeDefs,
    updateHotelTypeDefs,
    updateHotelAddressTypeDefs,
]);

export const resolvers = mergeResolvers([
    addHotelPhotosResolvers,
    addHotelResolvers,
    allHotelsResolvers,
    basicPriceSettingResolvers,
    hotelByIdResolvers,
    hotelNearestStationResolvers,
    hotelObjectResolvers,
    hotelRoomResolvers,
    myHotelsResolvers,
    packagePlanResolvers,
    priceOverrideResolvers,
    priceSchemeResolvers,
    removeHotelPhotoResolvers,
    updateHotelResolvers,
    updateHotelAddressResolvers,
]);
