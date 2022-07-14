import { mergeResolvers, mergeTypeDefs } from "@graphql-tools/merge";
import { roomPlanObjectResolvers, roomPlanObjectTypeDefs } from "./RoomPlanObject";

export const hotelRoomPlanTypeDefs = mergeTypeDefs([roomPlanObjectTypeDefs]);

export const hotelRoomPlanResolvers = mergeResolvers([roomPlanObjectResolvers]);

export * from "./RoomPlanObject";
