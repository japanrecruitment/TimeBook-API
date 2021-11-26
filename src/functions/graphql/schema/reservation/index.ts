import { mergeResolvers, mergeTypeDefs } from "@graphql-tools/merge";
import { reservationObjectTypeDefs } from "./ReservationObject";
import { reservationStatusResolver, reservationStatusTypeDef } from "./ReservationStatus";
import { reserveSpaceResolvers, reserveSpaceTypeDefs } from "./reserveSpace";

export const typeDefs = mergeTypeDefs([reservationStatusTypeDef, reservationObjectTypeDefs, reserveSpaceTypeDefs]);

export const resolvers = mergeResolvers([reservationStatusResolver, reserveSpaceResolvers]);
