import { IFieldResolver } from "@graphql-tools/utils";
import { addEmailToQueue, ReservationCompletedData } from "@utils/email-helper";
import { gql } from "apollo-server-core";
import { Context } from "../../../context";
import { GqlError } from "../../../error";
import { Result } from "../../core/result";

type ApproveRoomReservationArgs = {
    reservationId: string;
};

type ApproveRoomReservationResult = Result;

type ApproveRoomReservation = IFieldResolver<
    any,
    Context,
    ApproveRoomReservationArgs,
    Promise<ApproveRoomReservationResult>
>;

const approveRoomReservation: ApproveRoomReservation = async (_, { reservationId }, { authData, store }) => {
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
        data: { status: "RESERVED", approved: true, approvedOn: new Date() },
    });

    await addEmailToQueue<ReservationCompletedData>({
        template: "reservation-completed",
        recipientEmail: reservation.reservee.email,
        recipientName: "",
        spaceId: reservation.hotelRoom.id,
        reservationId,
    });

    return {
        message: "Successfully approved reservation.",
    };
};

export const approveRoomReservationTypeDefs = gql`
    type Mutation {
        approveRoomReservation(reservationId: ID!): Result @auth(requires: [host])
    }
`;

export const approveRoomReservationResolvers = {
    Mutation: { approveRoomReservation },
};
