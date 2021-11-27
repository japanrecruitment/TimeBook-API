import { mergeResolvers, mergeTypeDefs } from "@graphql-tools/merge";
import { myReservationsResolvers, myReservationsTypeDefs } from "./myReservations";
import { reservationObjectTypeDefs } from "./ReservationObject";
import { reservationStatusResolver, reservationStatusTypeDef } from "./ReservationStatus";
import { reserveSpaceResolvers, reserveSpaceTypeDefs } from "./reserveSpace";

export const typeDefs = mergeTypeDefs([
    reservationStatusTypeDef,
    reservationObjectTypeDefs,
    reserveSpaceTypeDefs,
    myReservationsTypeDefs,
]);

export const resolvers = mergeResolvers([reservationStatusResolver, reserveSpaceResolvers, myReservationsResolvers]);
