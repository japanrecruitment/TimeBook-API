import { IFieldResolver } from "@graphql-tools/utils";
import { addEmailToQueue, ReservationCompletedData, sendEmail } from "@utils/email-helper";
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
            id: true,
            reservee: { select: { email: true } },
            hotelRoom: { select: { id: true, hotel: { select: { accountId: true } } } },
            transaction: { select: { paymentIntentId: true } },
        },
    });
    // Log("reservation", reservation)
    if (!reservation) throw new GqlError({ code: "NOT_FOUND", message: "予約が見つかりません。" });

    if (reservation.hotelRoom?.hotel?.accountId !== accountId)
        throw new GqlError({ code: "UNAUTHORIZED", message: "無効なリクエスト" });

    await store.hotelRoomReservation.update({
        where: { id: reservation.id },
        data: { status: "RESERVED", approved: true, approvedOn: new Date() },
    });

    // Get host email for notification
    const hostAccount = await store.account.findUnique({
        where: { id: accountId },
        select: { email: true },
    });

    await Promise.all([
        // Email to customer
        addEmailToQueue<ReservationCompletedData>({
            template: "reservation-completed",
            recipientEmail: reservation.reservee.email,
            recipientName: reservation.reservee.email,
            spaceId: reservation.hotelRoom.id,
            reservationId,
            spaceType: "宿泊施",
        }),
        // Email to host
        addEmailToQueue<ReservationCompletedData>({
            template: "reservation-completed",
            recipientEmail: hostAccount.email,
            recipientName: hostAccount.email,
            spaceId: reservation.hotelRoom.id,
            reservationId,
            spaceType: "宿泊施",
        }),
    ]);

    return {
        message: "予約が承認されました。",
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
