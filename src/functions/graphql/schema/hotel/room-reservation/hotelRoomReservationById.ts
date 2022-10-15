import { IFieldResolver } from "@graphql-tools/utils";
import { Log } from "@utils/logger";
import { gql } from "apollo-server-core";
import { mapSelections } from "graphql-map-selections";
import { Context } from "../../../context";
import { HotelRoomReservationObject, toHotelRoomReservationSelect } from "./HotelRoomReservationObject";

type ReservationByIdArgs = { id: string };

type ReservationByIdResult = Promise<HotelRoomReservationObject>;

type ReservationById = IFieldResolver<any, Context, ReservationByIdArgs, ReservationByIdResult>;

const hotelRoomReservationById: ReservationById = async (_, { id }, { store }, info) => {
    const hotelRoomReservationSelect = toHotelRoomReservationSelect(mapSelections(info))?.select;
    const reservation = await store.hotelRoomReservation.findUnique({
        where: { id },
        select: hotelRoomReservationSelect,
    });

    Log(reservation);

    return reservation;
};

export const hotelRoomReservationByIdTypeDefs = gql`
    type Query {
        hotelRoomReservationById(id: ID!): HotelRoomReservationObject @auth(requires: [user, host])
    }
`;

export const hotelRoomReservationByIdResolvers = {
    Query: { hotelRoomReservationById },
};
