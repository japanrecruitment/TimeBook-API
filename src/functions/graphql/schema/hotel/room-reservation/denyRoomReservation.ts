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

    if (!reservation) throw new GqlError({ code: "NOT_FOUND", message: "予約が見つかりません" });

    if (reservation.hotelRoom?.hotel?.accountId !== accountId)
        throw new GqlError({ code: "UNAUTHORIZED", message: "無効なリクエスト" });

    await store.hotelRoomReservation.update({
        where: { id: reservationId },
        data: { status: "DISAPPROVED", approved: false, approvedOn: new Date() },
    });

    await addEmailToQueue<ReservationFailedData>({
        template: "reservation-failed",
        recipientEmail: reservation.reservee.email,
        recipientName: "",
        spaceId: reservation.hotelRoom.id,
    });

    return {
        message: "予約を拒否されました。",
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
