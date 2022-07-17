import { mergeResolvers, mergeTypeDefs } from "@graphql-tools/merge";
import { addHotelRoomResolvers, addHotelRoomTypeDefs } from "./addHotelRoom";
import { addHotelRoomPhotosResolvers, addHotelRoomPhotosTypeDefs } from "./addHotelRoomPhotos";
import { hotelRoomByIdResolvers, hotelRoomByIdTypeDefs } from "./hotelRoomById";
import { hotelRoomObjectResolvers, hotelRoomObjectTypeDefs } from "./HotelRoomObject";
import { myHotelRoomsResolvers, myHotelRoomsTypeDefs } from "./myHotelRooms";
import { removeHotelRoomPhotoResolvers, removeHotelRoomPhotoTypeDefs } from "./removeHotelPhoto";
import { updateHotelRoomResolvers, updateHotelRoomTypeDefs } from "./updateHotelRoom";
import {
    updateHotelRoomPriceSettingResolvers,
    updateHotelRoomPriceSettingTypeDefs,
} from "./updateHotelRoomPriceSetting";

export const hotelRoomTypeDefs = mergeTypeDefs([
    addHotelRoomPhotosTypeDefs,
    addHotelRoomTypeDefs,
    hotelRoomByIdTypeDefs,
    hotelRoomObjectTypeDefs,
    myHotelRoomsTypeDefs,
    removeHotelRoomPhotoTypeDefs,
    updateHotelRoomTypeDefs,
    updateHotelRoomPriceSettingTypeDefs,
]);

export const hotelRoomResolvers = mergeResolvers([
    addHotelRoomPhotosResolvers,
    addHotelRoomResolvers,
    hotelRoomByIdResolvers,
    hotelRoomObjectResolvers,
    myHotelRoomsResolvers,
    removeHotelRoomPhotoResolvers,
    updateHotelRoomResolvers,
    updateHotelRoomPriceSettingResolvers,
]);

export * from "./HotelRoomObject";
export * from "./addHotelRoom";
