import { mergeResolvers, mergeTypeDefs } from "@graphql-tools/merge";
import { apporveReservationResolvers, approveReservationTypeDefs } from "./approveReservation";
import { getApplicablePricePlansResolvers, getApplicablePricePlansTypeDefs } from "./getApplicablePricePlans";
import { myReservationsResolvers, myReservationsTypeDefs } from "./myReservations";
import { reservationByIdResolvers, reservationByIdTypeDefs } from "./reservationById";
import { reservationObjectResolvers, reservationObjectTypeDefs } from "./ReservationObject";
import { reservationsResolvers, reservationsTypeDefs } from "./reservations";
import { reservationStatusResolver, reservationStatusTypeDef } from "./ReservationStatus";
import { reserveSpaceResolvers, reserveSpaceTypeDefs } from "./reserveSpace";

export const typeDefs = mergeTypeDefs([
    reservationStatusTypeDef,
    reservationObjectTypeDefs,
    reserveSpaceTypeDefs,
    myReservationsTypeDefs,
    approveReservationTypeDefs,
    reservationsTypeDefs,
    getApplicablePricePlansTypeDefs,
    reservationByIdTypeDefs,
]);

export const resolvers = mergeResolvers([
    reservationStatusResolver,
    reservationObjectResolvers,
    reserveSpaceResolvers,
    myReservationsResolvers,
    apporveReservationResolvers,
    reservationsResolvers,
    getApplicablePricePlansResolvers,
    reservationByIdResolvers,
]);
