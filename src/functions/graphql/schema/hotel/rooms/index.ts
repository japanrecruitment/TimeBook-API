import { mergeResolvers, mergeTypeDefs } from "@graphql-tools/merge";
import { addHotelRoomResolvers, addHotelRoomTypeDefs } from "./addHotelRoom";
import { addHotelRoomPhotosResolvers, addHotelRoomPhotosTypeDefs } from "./addHotelRoomPhotos";
import {
    addPriceOverrideInHotelRoomResolvers,
    addPriceOverrideInHotelRoomTypeDefs,
} from "./addPriceOverrideInHotelRoom";
import { hotelRoomByIdResolvers, hotelRoomByIdTypeDefs } from "./hotelRoomById";
import { hotelRoomObjectResolvers, hotelRoomObjectTypeDefs } from "./HotelRoomObject";
import { myHotelRoomsResolvers, myHotelRoomsTypeDefs } from "./myHotelRooms";
import { removeHotelRoomPhotoResolvers, removeHotelRoomPhotoTypeDefs } from "./removeHotelRoomPhoto";
import {
    removePriceOverrideFromHotelRoomResolvers,
    removePriceOverrideFromHotelRoomTypeDefs,
} from "./removePriceOverrideFromHotelRoom";
import { updateHotelRoomResolvers, updateHotelRoomTypeDefs } from "./updateHotelRoom";
import {
    updateHotelRoomPriceSettingResolvers,
    updateHotelRoomPriceSettingTypeDefs,
} from "./updateHotelRoomPriceSetting";
import {
    updatePriceOverrideInHotelRoomResolvers,
    updatePriceOverrideInHotelRoomTypeDefs,
} from "./updatePriceOverrideInHotelRoom";

export const hotelRoomTypeDefs = mergeTypeDefs([
    addHotelRoomPhotosTypeDefs,
    addHotelRoomTypeDefs,
    addPriceOverrideInHotelRoomTypeDefs,
    hotelRoomByIdTypeDefs,
    hotelRoomObjectTypeDefs,
    myHotelRoomsTypeDefs,
    removeHotelRoomPhotoTypeDefs,
    removePriceOverrideFromHotelRoomTypeDefs,
    updateHotelRoomTypeDefs,
    updateHotelRoomPriceSettingTypeDefs,
    updatePriceOverrideInHotelRoomTypeDefs,
]);

export const hotelRoomResolvers = mergeResolvers([
    addHotelRoomPhotosResolvers,
    addHotelRoomResolvers,
    addPriceOverrideInHotelRoomResolvers,
    hotelRoomByIdResolvers,
    hotelRoomObjectResolvers,
    myHotelRoomsResolvers,
    removeHotelRoomPhotoResolvers,
    removePriceOverrideFromHotelRoomResolvers,
    updateHotelRoomResolvers,
    updateHotelRoomPriceSettingResolvers,
    updatePriceOverrideInHotelRoomResolvers,
]);

export * from "./HotelRoomObject";
export * from "./addHotelRoom";
