import { IFieldResolver } from "@graphql-tools/utils";
import { StripeLib } from "@libs/paymentProvider";
import { appConfig } from "@utils/appConfig";
import { environment } from "@utils/environment";
import { gql } from "apollo-server-core";
import { isEmpty } from "lodash";
import moment from "moment";
import Stripe from "stripe";
import { Context } from "../../../context";
import { GqlError } from "../../../error";
import { Result } from "../../core/result";

type CancelRoomReservationInput = {
    hotelRoomReservationId: string;
    cancelCharge?: number;
    remarks?: string;
};

type CancelRoomReservationArgs = { input: CancelRoomReservationInput };

type CancelRoomReservationResult = Promise<Result>;

type CancelRoomReservation = IFieldResolver<any, Context, CancelRoomReservationArgs, CancelRoomReservationResult>;

const cancelRoomReservation: CancelRoomReservation = async (_, { input }, { authData, store }) => {
    const { accountId } = authData;

    const { hotelRoomReservationId, cancelCharge = 0, remarks } = input;

    if (cancelCharge > 100 || cancelCharge < 0)
        throw new GqlError({ code: "BAD_USER_INPUT", message: "Invalid cancellation charge" });

    const reservation = await store.hotelRoomReservation.findUnique({
        where: { id: hotelRoomReservationId },
        select: {
            fromDateTime: true,
            reserveeId: true,
            status: true,
            reservee: { select: { suspended: true } },
            packagePlan: {
                select: {
                    id: true,
                    hotel: {
                        select: {
                            id: true,
                            account: { select: { id: true, suspended: true, host: { select: { suspended: true } } } },
                            cancelPolicy: { select: { rates: { orderBy: { beforeHours: "asc" } } } },
                        },
                    },
                },
            },
            transaction: { select: { amount: true, paymentIntentId: true, responseReceivedLog: true } },
        },
    });

    if (!reservation) throw new GqlError({ code: "NOT_FOUND", message: "Reservation not found" });

    if (!reservation.packagePlan || !reservation.packagePlan.hotel || !reservation.packagePlan.hotel.account)
        throw new GqlError({ code: "FORBIDDEN", message: "Invalid reservation found" });

    if (reservation.reserveeId !== accountId && reservation.packagePlan.hotel.account.id !== accountId)
        throw new GqlError({ code: "UNAUTHORIZED", message: "Not Authorized" });

    if (reservation.status === "CANCELED")
        throw new GqlError({ code: "BAD_REQUEST", message: "Reservation already canceled" });

    if (reservation.status === "DISAPPROVED")
        throw new GqlError({ code: "BAD_REQUEST", message: "Cannot cancel a disapproved reservation" });

    if (reservation.status === "FAILED")
        throw new GqlError({ code: "BAD_REQUEST", message: "Cannot cancel a failed reservation" });

    const isHost = reservation.packagePlan.hotel.account.id === accountId;

    const isSuspended = isHost
        ? reservation.packagePlan.hotel.account.suspended || reservation.packagePlan.hotel.account.host.suspended
        : reservation.reservee.suspended;
    if (isSuspended)
        throw new GqlError({ code: "FORBIDDEN", message: "You are suspended. Please contact our support team." });

    const stripe = new StripeLib();
    await stripe.cancelPaymentIntent(reservation.transaction.paymentIntentId);

    if (reservation.packagePlan.hotel.account.suspended || reservation.packagePlan.hotel.account.host.suspended) {
        await store.hotelRoomReservation.update({
            where: { id: hotelRoomReservationId },
            data: { status: "CANCELED", remarks, transaction: { update: { status: "CANCELED" } } },
        });
        return { message: "Successfully canceled reservation." };
    }

    let cancellationChargeRate = isHost ? cancelCharge / 100 : 0;

    if (!isHost) {
        const cancelPolicyRates = reservation.packagePlan.hotel.cancelPolicy?.rates;
        if (isEmpty(cancelPolicyRates)) {
            await store.hotelRoomReservation.update({
                where: { id: hotelRoomReservationId },
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
        await store.hotelRoomReservation.update({
            where: { id: hotelRoomReservationId },
            data: { status: "CANCELED", remarks, transaction: { update: { status: "CANCELED" } } },
        });
        return { message: "Successfully canceled reservation." };
    }

    const amount = cancellationChargeRate * reservation.transaction.amount;
    const applicationFeeAmount = parseInt((amount * (appConfig.platformFeePercent / 100)).toString());

    const paymentIntent = reservation.transaction?.responseReceivedLog as any;

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

    return { message: `Successfully canceled reservation. You have been charged ${amount} as cancellation fees.` };
};

export const cancelRoomReservationTypeDefs = gql`
    input CancelRoomReservationInput {
        hotelRoomReservationId: ID!
        cancelCharge: Int
        remarks: String
    }

    type Mutation {
        cancelRoomReservation(input: CancelRoomReservationInput!): Result @auth(requires: [user, host])
    }
`;

export const cancelRoomReservationResolvers = {
    Mutation: { cancelRoomReservation },
};
