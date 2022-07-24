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
import { publishHotelResolvers, publishHotelTypeDefs } from "./publishHotel";
import { stockOverrideResolvers, stockOverrideTypeDefs } from "./stock-override";
import { roomReservationResolvers, roomReservationTypeDefs } from "./room-reservation";
import { allPublishedHotelsResolvers, allPublishedHotelsTypeDefs } from "./allPublishedHotels";
import { linkHotelToCancelPoliciesResolvers, linkHotelToCancelPoliciesTypeDefs } from "./linkHotelToCancelPolicies";

export const typeDefs = mergeTypeDefs([
    addHotelPhotosTypeDefs,
    addHotelTypeDefs,
    allHotelsTypeDefs,
    allPublishedHotelsTypeDefs,
    basicPriceSettingTypeDefs,
    hotelByIdTypeDefs,
    hotelNearestStationTypeDefs,
    hotelObjectTypeDefs,
    hotelRoomTypeDefs,
    linkHotelToCancelPoliciesTypeDefs,
    myHotelsTypeDefs,
    packagePlanTypeDefs,
    priceOverrideTypeDefs,
    priceSchemeTypeDefs,
    publishHotelTypeDefs,
    removeHotelPhotoTypeDefs,
    roomReservationTypeDefs,
    stockOverrideTypeDefs,
    updateHotelTypeDefs,
    updateHotelAddressTypeDefs,
]);

export const resolvers = mergeResolvers([
    addHotelPhotosResolvers,
    addHotelResolvers,
    allHotelsResolvers,
    allPublishedHotelsResolvers,
    basicPriceSettingResolvers,
    hotelByIdResolvers,
    hotelNearestStationResolvers,
    hotelObjectResolvers,
    hotelRoomResolvers,
    linkHotelToCancelPoliciesResolvers,
    myHotelsResolvers,
    packagePlanResolvers,
    priceOverrideResolvers,
    priceSchemeResolvers,
    publishHotelResolvers,
    removeHotelPhotoResolvers,
    roomReservationResolvers,
    stockOverrideResolvers,
    updateHotelResolvers,
    updateHotelAddressResolvers,
]);
