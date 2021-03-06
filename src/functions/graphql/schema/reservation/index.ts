import { mergeResolvers, mergeTypeDefs } from "@graphql-tools/merge";
import { apporveReservationResolvers, approveReservationTypeDefs } from "./approveReservation";
import { myReservationsResolvers, myReservationsTypeDefs } from "./myReservations";
import { reservationObjectTypeDefs } from "./ReservationObject";
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
]);

export const resolvers = mergeResolvers([
    reservationStatusResolver,
    reserveSpaceResolvers,
    myReservationsResolvers,
    apporveReservationResolvers,
    reservationsResolvers,
]);
