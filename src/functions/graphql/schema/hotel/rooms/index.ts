import { mergeResolvers, mergeTypeDefs } from "@graphql-tools/merge";
import { addHotelRoomResolvers, addHotelRoomTypeDefs } from "./addHotelRoom";
import { hotelRoomByIdResolvers, hotelRoomByIdTypeDefs } from "./hotelRoomById";
import { hotelRoomObjectResolvers, hotelRoomObjectTypeDefs } from "./HotelRoomObject";
import { myHotelRoomsResolvers, myHotelRoomsTypeDefs } from "./myHotelRooms";

export const hotelRoomTypeDefs = mergeTypeDefs([
    addHotelRoomTypeDefs,
    hotelRoomObjectTypeDefs,
    myHotelRoomsTypeDefs,
    hotelRoomByIdTypeDefs,
]);

export const hotelRoomResolvers = mergeResolvers([
    addHotelRoomResolvers,
    hotelRoomObjectResolvers,
    myHotelRoomsResolvers,
    hotelRoomByIdResolvers,
]);

export * from "./HotelRoomObject";
export * from "./addHotelRoom";
