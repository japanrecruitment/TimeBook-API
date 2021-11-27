import { mergeResolvers, mergeTypeDefs } from "@graphql-tools/merge";
import { apporveReservationResolvers, approveReservationTypeDefs } from "./approveReservation";
import { myReservationsResolvers, myReservationsTypeDefs } from "./myReservations";
import { reservationObjectTypeDefs } from "./ReservationObject";
import { reservationStatusResolver, reservationStatusTypeDef } from "./ReservationStatus";
import { reserveSpaceResolvers, reserveSpaceTypeDefs } from "./reserveSpace";

export const typeDefs = mergeTypeDefs([
    reservationStatusTypeDef,
    reservationObjectTypeDefs,
    reserveSpaceTypeDefs,
    myReservationsTypeDefs,
    approveReservationTypeDefs,
]);

export const resolvers = mergeResolvers([
    reservationStatusResolver,
    reserveSpaceResolvers,
    myReservationsResolvers,
    apporveReservationResolvers,
]);
