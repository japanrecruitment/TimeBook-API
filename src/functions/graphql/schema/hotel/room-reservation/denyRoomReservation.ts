import { IFieldResolver } from "@graphql-tools/utils";
import { addEmailToQueue, ReservationFailedData } from "@utils/email-helper";
import { gql } from "apollo-server-core";
import { Context } from "../../../context";
import { GqlError } from "../../../error";
import { Result } from "../../core/result";

type DenyRoomReservationArgs = {
    reservationId: string;
};

type DenyRoomReservationResult = Result;

type DenyRoomReservation = IFieldResolver<any, Context, DenyRoomReservationArgs, Promise<DenyRoomReservationResult>>;

const denyRoomReservation: DenyRoomReservation = async (_, { reservationId }, { authData, store }) => {
    const { accountId } = authData;

    const reservation = await store.hotelRoomReservation.findFirst({
        where: { id: reservationId },
        select: {
            reservee: { select: { email: true } },
            hotelRoom: { select: { id: true, hotel: { select: { accountId: true } } } },
            transaction: { select: { paymentIntentId: true } },
        },
    });

    if (!reservation) throw new GqlError({ code: "NOT_FOUND", message: "Reservation doesn't exist" });

    if (reservation.hotelRoom?.hotel?.accountId !== accountId)
        throw new GqlError({ code: "UNAUTHORIZED", message: "You are not authorize to modify this reservation" });

    if (!reservation.transaction?.paymentIntentId)
        throw new GqlError({ code: "FORBIDDEN", message: "Payment intent id not found" });

    await store.hotelRoomReservation.update({
        where: { id: reservationId },
        data: { status: "RESERVED", approved: false, approvedOn: new Date() },
    });

    await addEmailToQueue<ReservationFailedData>({
        template: "reservation-failed",
        recipientEmail: reservation.reservee.email,
        recipientName: "",
        spaceId: reservation.hotelRoom.id,
    });

    return {
        message: "Successfully approved reservation.",
    };
};

export const denyRoomReservationTypeDefs = gql`
    type Mutation {
        denyRoomReservation(reservationId: ID!): Result @auth(requires: [host])
    }
`;

export const denyRoomReservationResolvers = {
    Mutation: { denyRoomReservation },
};
