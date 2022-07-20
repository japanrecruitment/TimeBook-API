import { mergeResolvers, mergeTypeDefs } from "@graphql-tools/merge";
import { calculateRoomPlanPriceResolvers, calculateRoomPlanPriceTypeDefs } from "./calculateRoomPlanPrice";
import { reserveHotelRoomResolvers, reserveHotelRoomTypeDefs } from "./reserveHotelRoom";

export const roomReservationTypeDefs = mergeTypeDefs([calculateRoomPlanPriceTypeDefs, reserveHotelRoomTypeDefs]);

export const roomReservationResolvers = mergeResolvers([calculateRoomPlanPriceResolvers, reserveHotelRoomResolvers]);
