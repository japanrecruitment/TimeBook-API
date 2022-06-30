import { mergeResolvers, mergeTypeDefs } from "@graphql-tools/merge";
import { addHotelRoomResolvers, addHotelRoomTypeDefs } from "./addHotelRoom";
import { hotelRoomObjectResolvers, hotelRoomObjectTypeDefs } from "./HotelRoomObject";

export const hotelRoomTypeDefs = mergeTypeDefs([addHotelRoomTypeDefs, hotelRoomObjectTypeDefs]);

export const hotelRoomResolvers = mergeResolvers([addHotelRoomResolvers, hotelRoomObjectResolvers]);

export * from "./HotelRoomObject";
export * from "./addHotelRoom";
