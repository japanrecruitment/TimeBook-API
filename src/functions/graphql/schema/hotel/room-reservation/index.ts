import { mergeResolvers, mergeTypeDefs } from "@graphql-tools/merge";
import { approveRoomReservationResolvers, approveRoomReservationTypeDefs } from "./approveRoomReservation";
import { calculateRoomPlanPriceResolvers, calculateRoomPlanPriceTypeDefs } from "./calculateRoomPlanPrice";
import { denyRoomReservationResolvers, denyRoomReservationTypeDefs } from "./denyRoomReservation";
import { reserveHotelRoomResolvers, reserveHotelRoomTypeDefs } from "./reserveHotelRoom";

export const roomReservationTypeDefs = mergeTypeDefs([
    approveRoomReservationTypeDefs,
    calculateRoomPlanPriceTypeDefs,
    denyRoomReservationTypeDefs,
    reserveHotelRoomTypeDefs,
]);

export const roomReservationResolvers = mergeResolvers([
    approveRoomReservationResolvers,
    calculateRoomPlanPriceResolvers,
    denyRoomReservationResolvers,
    reserveHotelRoomResolvers,
]);
