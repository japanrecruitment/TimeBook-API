import { IFieldResolver } from "@graphql-tools/utils";
import { StripeLib } from "@libs/paymentProvider";
import { appConfig } from "@utils/appConfig";
import { environment } from "@utils/environment";
import { gql } from "apollo-server-core";
import { isEmpty } from "lodash";
import moment from "moment";
import Stripe from "stripe";
import { Context } from "../../context";
import { GqlError } from "../../error";
import { Result } from "../core/result";

type CancelReservationInput = {
    reservationId: string;
    cancelCharge?: number;
    remarks?: string;
};

type CancelReservationArgs = { input: CancelReservationInput };

type CancelReservationResult = Promise<Result>;

type CancelReservation = IFieldResolver<any, Context, CancelReservationArgs, CancelReservationResult>;

const cancelReservation: CancelReservation = async (_, { input }, { authData, store }) => {
    const { accountId } = authData;

    const { reservationId, cancelCharge = 0, remarks } = input;

    if (cancelCharge > 100 || cancelCharge < 0)
        throw new GqlError({ code: "BAD_USER_INPUT", message: "Invalid cancellation charge" });

    const reservation = await store.reservation.findUnique({
        where: { id: reservationId },
        select: {
            fromDateTime: true,
            reserveeId: true,
            status: true,
            subscriptionPrice: true,
            subscriptionUnit: true,
            reservee: { select: { suspended: true } },
            space: {
                select: {
                    account: { select: { id: true, suspended: true, host: { select: { suspended: true } } } },
                    cancelPolicy: { select: { rates: { orderBy: { beforeHours: "asc" } } } },
                },
            },
            transaction: { select: { amount: true, paymentIntentId: true, responseReceivedLog: true } },
        },
    });

    if (!reservation) throw new GqlError({ code: "NOT_FOUND", message: "Reservation not found" });

    if (reservation.reserveeId !== accountId && reservation.space.account.id !== accountId)
        throw new GqlError({ code: "UNAUTHORIZED", message: "Not Authorized" });

    if (reservation.status === "CANCELED")
        throw new GqlError({ code: "BAD_REQUEST", message: "Reservation already canceled" });

    if (reservation.status === "DISAPPROVED")
        throw new GqlError({ code: "BAD_REQUEST", message: "Cannot cancel a disapproved reservation" });

    if (reservation.status === "FAILED")
        throw new GqlError({ code: "BAD_REQUEST", message: "Cannot cancel a failed reservation" });

    const isHost = reservation.space.account.id === accountId;

    if (isHost && (reservation.space.account.suspended || reservation.space.account.host.suspended))
        throw new GqlError({ code: "FORBIDDEN", message: "You are suspended. Please contact our support team." });
    else if (!isHost && reservation.reservee.suspended)
        throw new GqlError({ code: "FORBIDDEN", message: "You are suspended. Please contact our support team." });

    const stripe = new StripeLib();
    await stripe.cancelPaymentIntent(reservation.transaction.paymentIntentId);

    if (reservation.space.account.suspended || reservation.space.account.host.suspended) {
        await store.reservation.update({
            where: { id: reservationId },
            data: { status: "CANCELED", remarks, transaction: { update: { status: "CANCELED" } } },
        });
        return { message: "Successfully canceled reservation." };
    }

    let cancellationChargeRate = isHost ? cancelCharge / 100 : 0;

    if (!isHost) {
        const cancelPolicyRates = reservation.space.cancelPolicy?.rates;
        if (isEmpty(cancelPolicyRates)) {
            await store.reservation.update({
                where: { id: reservationId },
                data: { status: "CANCELED", remarks, transaction: { update: { status: "CANCELED" } } },
            });
            return { message: "Successfully canceled reservation." };
        }

        const currDateMillis = Date.now();
        for (const { beforeHours, percentage } of cancelPolicyRates) {
            const beforeHrsDateMillis = moment(reservation.fromDateTime)
                .subtract(beforeHours, "hours")
                .toDate()
                .getTime();
            if (currDateMillis >= beforeHrsDateMillis) {
                cancellationChargeRate = percentage / 100;
                break;
            }
        }
    }

    if (cancellationChargeRate <= 0) {
        await store.reservation.update({
            where: { id: reservationId },
            data: { status: "CANCELED", remarks, transaction: { update: { status: "CANCELED" } } },
        });
        return { message: "Successfully canceled reservation." };
    }

    const amount = cancellationChargeRate * reservation.transaction.amount;
    const applicationFeeAmount = parseInt((amount * (appConfig.platformFeePercent / 100)).toString());

    const paymentIntent = reservation.transaction?.responseReceivedLog as any;

    if (!paymentIntent && !reservation.subscriptionPrice && !reservation.subscriptionUnit) {
        await store.reservation.update({
            where: { id: reservationId },
            data: { status: "CANCELED", remarks, transaction: { update: { status: "CANCELED" } } },
        });
        return { message: `Successfully canceled reservation.` };
    }

    if (!paymentIntent)
        throw new GqlError({
            code: "BAD_REQUEST",
            message: "Payment intent not found in your reservation transaction.",
        });

    const paymentIntentParams: Stripe.PaymentIntentCreateParams = {
        amount,
        currency: paymentIntent.currency,
        customer: paymentIntent.customer,
        payment_method: paymentIntent.payment_method,
        payment_method_types: paymentIntent.payment_method_types,
        description: paymentIntent.description,
        receipt_email: paymentIntent.receipt_email,
        capture_method: "automatic",
        metadata: paymentIntent.metadata,
        statement_descriptor: `CANCEL_${environment.APP_READABLE_NAME}`.substring(0, 22),
        application_fee_amount: applicationFeeAmount,
        transfer_data: paymentIntent.transfer_data,
        confirm: true,
    };

    await stripe.createPaymentIntent(paymentIntentParams);

    await store.reservation.update({
        where: { id: reservationId },
        data: { status: "CANCELED", remarks, transaction: { update: { status: "CANCELED" } } },
    });
    return { message: `Successfully canceled reservation. You have been charged ${amount} as cancellation fees.` };
};

export const cancelReservationTypeDefs = gql`
    input CancelReservationInput {
        reservationId: ID!
        cancelCharge: Int
        remarks: String
    }

    type Mutation {
        cancelReservation(input: CancelReservationInput!): Result @auth(requires: [user, host])
    }
`;

export const cancelReservationResolvers = {
    Mutation: { cancelReservation },
};
