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
            reservee: { select: { email: true } },
            space: { select: { id: true, accountId: true } },
            transaction: { select: { paymentIntentId: true } },
        },
    });

    if (!reservation) throw new GqlError({ code: "NOT_FOUND", message: "Reservation doesn't exist" });

    if (reservation.space.accountId !== accountId)
        throw new GqlError({ code: "UNAUTHORIZED", message: "You are not authorize to modify this reservation" });

    if (!reservation.transaction.paymentIntentId)
        throw new GqlError({ code: "FORBIDDEN", message: "Payment intent id not found" });

    const stripe = new StripeLib();
    await stripe.capturePayment(reservation.transaction.paymentIntentId);

    await store.reservation.update({
        where: { id: reservationId },
        data: { status: "RESERVED", approved: true, approvedOn: new Date() },
    });

    await addEmailToQueue<ReservationCompletedData>({
        template: "reservation-completed",
        recipientEmail: reservation.reservee.email,
        recipientName: "",
        spaceId: reservation.space.id,
    });

    return {
        message: "Successfully approved reservation.",
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
