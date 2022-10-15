import { mergeResolvers, mergeTypeDefs } from "@graphql-tools/merge";
import { approveRoomReservationResolvers, approveRoomReservationTypeDefs } from "./approveRoomReservation";
import { calculateRoomPlanPriceResolvers, calculateRoomPlanPriceTypeDefs } from "./calculateRoomPlanPrice";
import {
    calculateRoomPlanPriceWithAuthResolvers,
    calculateRoomPlanPriceWithAuthTypeDefs,
} from "./calculateRoomPlanPriceWithAuth";
import { cancelRoomReservationResolvers, cancelRoomReservationTypeDefs } from "./cancelRoomReservation";
import { denyRoomReservationResolvers, denyRoomReservationTypeDefs } from "./denyRoomReservation";
import { hotelRoomReservationByIdResolvers, hotelRoomReservationByIdTypeDefs } from "./hotelRoomReservationById";
import { hotelRoomReservationObjectResolvers, hotelRoomReservationObjectTypeDefs } from "./HotelRoomReservationObject";
import { hotelRoomReservationsResolvers, hotelRoomReservationsTypeDefs } from "./hotelRoomReservations";
import { myHotelRoomReservationResolvers, myHotelRoomReservationTypeDefs } from "./myHotelRoomReservations";
import { reserveHotelRoomResolvers, reserveHotelRoomTypeDefs } from "./reserveHotelRoom";

export const roomReservationTypeDefs = mergeTypeDefs([
    approveRoomReservationTypeDefs,
    calculateRoomPlanPriceTypeDefs,
    calculateRoomPlanPriceWithAuthTypeDefs,
    cancelRoomReservationTypeDefs,
    denyRoomReservationTypeDefs,
    hotelRoomReservationByIdTypeDefs,
    hotelRoomReservationObjectTypeDefs,
    hotelRoomReservationsTypeDefs,
    myHotelRoomReservationTypeDefs,
    reserveHotelRoomTypeDefs,
]);

export const roomReservationResolvers = mergeResolvers([
    approveRoomReservationResolvers,
    calculateRoomPlanPriceResolvers,
    calculateRoomPlanPriceWithAuthResolvers,
    cancelRoomReservationResolvers,
    denyRoomReservationResolvers,
    hotelRoomReservationByIdResolvers,
    hotelRoomReservationObjectResolvers,
    hotelRoomReservationsResolvers,
    myHotelRoomReservationResolvers,
    reserveHotelRoomResolvers,
]);

export * from "./HotelRoomReservationObject";
