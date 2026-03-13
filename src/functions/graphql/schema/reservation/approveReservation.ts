import { IFieldResolver } from "@graphql-tools/utils";
import { StripeLib } from "@libs/paymentProvider";
import { addEmailToQueue, ReservationCompletedData } from "@utils/email-helper";
import { gql } from "apollo-server-core";
import { Context } from "../../context";
import { GqlError } from "../../error";
import { Result } from "../core/result";

type ApproveReservationArgs = {
    reservationId: string;
};

type ApproveReservationResult = Result;

type ApproveReservation = IFieldResolver<any, Context, ApproveReservationArgs, Promise<ApproveReservationResult>>;

const approveReservation: ApproveReservation = async (_, { reservationId }, { authData, store }) => {
    const { accountId } = authData;

    const reservation = await store.reservation.findFirst({
        where: { id: reservationId },
        select: {
            id: true,
            reservee: { select: { email: true } },
            space: { select: { id: true, accountId: true } },
            transaction: { select: { paymentIntentId: true } },
        },
    });
    console.log(reservation, "reservation");
    // Reservation not found
    if (!reservation) throw new GqlError({ code: "NOT_FOUND", message: "予約が見つかりませんでした。" });

    // unauthorized access
    if (reservation.space.accountId !== accountId) throw new GqlError({ code: "UNAUTHORIZED", message: "無許可" });

    await store.reservation.update({
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
            spaceId: reservation.space.id,
            reservationId,
        }),
        // Email to host
        addEmailToQueue<ReservationCompletedData>({
            template: "reservation-completed",
            recipientEmail: hostAccount.email,
            recipientName: hostAccount.email,
            spaceId: reservation.space.id,
            reservationId,
        }),
    ]);

    // reservation approved.
    return {
        message: "ご予約が成立いたしました。",
    };
};

export const approveReservationTypeDefs = gql`
    type Mutation {
        approveReservation(reservationId: ID!): Result @auth(requires: [host])
    }
`;

export const apporveReservationResolvers = {
    Mutation: { approveReservation },
};
