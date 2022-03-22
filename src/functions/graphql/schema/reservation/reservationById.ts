import { ReservationStatus, Prisma } from "@prisma/client";
import { IFieldResolver } from "@graphql-tools/utils";
import { Log } from "@utils/logger";
import { gql } from "apollo-server-core";
import { mapSelections } from "graphql-map-selections";
import { Context } from "../../context";
import { ReservationObject, toReservationSelect } from "./ReservationObject";

type ReservationByIdArgs = { id: string };

type ReservationByIdResult = Promise<ReservationObject>;

type ReservationById = IFieldResolver<any, Context, ReservationByIdArgs, ReservationByIdResult>;

const reservationById: ReservationById = async (_, { id }, { store }, info) => {
    const reservation = await store.reservation.findUnique({
        where: { id },
        ...toReservationSelect(mapSelections(info)),
    });

    Log(reservation);

    return reservation;
};

export const reservationByIdTypeDefs = gql`
    type Query {
        reservationById(id: ID!): ReservationObject @auth(requires: [user, host])
    }
`;

export const reservationByIdResolvers = {
    Query: { reservationById },
};
