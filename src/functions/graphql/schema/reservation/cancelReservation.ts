import { IFieldResolver } from "@graphql-tools/utils";
import { StripeLib } from "@libs/paymentProvider";
import { gql } from "apollo-server-core";
import { Context } from "../../context";
import { GqlError } from "../../error";
import { Result } from "../core/result";

type CancelReservationArgs = {
    reservationId: string;
};

type CancelReservationResult = Promise<Result>;

type CancelReservation = IFieldResolver<any, Context, CancelReservationArgs, CancelReservationResult>;

const cancelReservation: CancelReservation = async (_, { reservationId }, { authData, store }) => {
    const { accountId } = authData;

    const reservation = await store.reservation.findUnique({
        where: { id: reservationId },
        select: {
            fromDateTime: true,
            reserveeId: true,
            status: true,
            reservee: { select: { suspended: true } },
            transaction: { select: { paymentIntentId: true } },
        },
    });

    if (!reservation) throw new GqlError({ code: "NOT_FOUND", message: "Reservation not found" });

    if (reservation.reserveeId !== accountId) throw new GqlError({ code: "UNAUTHORIZED", message: "Not Authorized" });

    if (reservation.status === "CANCELED")
        throw new GqlError({ code: "BAD_REQUEST", message: "Reservation already canceled" });

    if (reservation.status === "DISAPPROVED")
        throw new GqlError({ code: "BAD_REQUEST", message: "Cannot cancel a disapproved reservation" });

    if (reservation.status === "FAILED")
        throw new GqlError({ code: "BAD_REQUEST", message: "Cannot cancel a failed reservation" });

    if (reservation.reservee.suspended)
        throw new GqlError({ code: "FORBIDDEN", message: "You are suspended. Please contact our support team." });

    await store.reservation.update({ where: { id: reservationId }, data: { status: "CANCELED" } });

    const stripe = new StripeLib();

    await stripe.cancelPaymentIntent(reservation.transaction.paymentIntentId);

    return { message: "Successfully canceled reservation." };
};

export const cancelReservationTypeDefs = gql`
    type Mutation {
        cancelReservation(reservationId: ID!): Result @auth(requires: [user])
    }
`;

export const cancelReservationResolvers = {
    Mutation: { cancelReservation },
};
