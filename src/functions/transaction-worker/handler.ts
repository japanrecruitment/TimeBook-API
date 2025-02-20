import { SQSHandler } from "aws-lambda";
import middy from "@middy/core";
import doNotWaitForEmptyEventLoop from "@middy/do-not-wait-for-empty-event-loop";
import { ForceLog, Log } from "@utils/logger";
import { Transaction } from "@prisma/client";
import { StripeLib } from "@libs/paymentProvider";
import { store } from "@utils/store";
import Stripe from "stripe";

type TransactionInfo = Pick<Transaction, "id">;

const transactionQueueWorker: SQSHandler = async (event) => {
    if (event.Records.length === 0) return;
    const body = JSON.parse(event.Records[0].body);
    const action = body?.action;
    const transactionInfo: TransactionInfo = body?.transaction;

    if (!action || !transactionInfo) {
        Log("EMPTY ACTION AND TRANSACTION");
        return;
    }

    const transaction = await store.transaction.findUnique({
        where: { id: transactionInfo.id },
        include: {
            hotelRoomReservation: {
                select: {
                    id: true,
                    subscriptionPrice: true,
                    hotelRoom: {
                        select: {
                            hotel: {
                                select: {
                                    account: {
                                        select: {
                                            host: true,
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            },
            reservation: {
                select: {
                    id: true,
                    subscriptionPrice: true,
                    space: {
                        select: {
                            account: {
                                select: {
                                    host: true,
                                },
                            },
                        },
                    },
                },
            },
        },
    });

    if (!transaction) {
        Log(`Transaction not found`, transactionInfo);
        return;
    }

    if (transaction.status === "FAILED" || transaction.status === "CANCELED") {
        Log(`Transaction is already ${transaction.status.toLowerCase()}`, transactionInfo);
        return;
    }

    const stripe = new StripeLib();
    if (action === "reauthorize") {
        const paymentIntent = transaction.responseReceivedLog as any;
        if (paymentIntent) {
            const paymentIntentParams: Stripe.PaymentIntentCreateParams = {
                amount: paymentIntent.amount,
                currency: paymentIntent.currency,
                customer: paymentIntent.customer,
                payment_method: paymentIntent.payment_method,
                payment_method_types: paymentIntent.payment_method_types,
                description: paymentIntent.description,
                receipt_email: paymentIntent.receipt_email,
                capture_method: paymentIntent.capture_method,
                metadata: paymentIntent.metadata,
                statement_descriptor: paymentIntent.statement_descriptor,
                application_fee_amount: paymentIntent.application_fee_amount,
                transfer_data: paymentIntent.transfer_data,
                confirm: true,
            };
            await stripe.cancelPaymentIntent(paymentIntent.id);
            const newPaymentIntent = await stripe.createPaymentIntent(paymentIntentParams);
            await store.transaction.update({
                where: { id: transaction.id },
                data: {
                    paymentIntentId: newPaymentIntent.id,
                    requestedLog: paymentIntentParams as any,
                    responseReceivedLog: newPaymentIntent as any,
                    lastAuthorizedDate: new Date(),
                },
            });
            return;
        }
        await store.transaction.update({ where: { id: transaction.id }, data: { lastAuthorizedDate: new Date() } });
        return;
    }

    if (action === "capture") {
        try {
            if (transaction.paymentIntentId) await stripe.capturePayment(transaction.paymentIntentId);
            if (transaction.hotelRoomReservation?.subscriptionPrice || transaction.reservation?.subscriptionPrice) {
                const destination =
                    transaction.hotelRoomReservation?.hotelRoom.hotel.account.host.stripeAccountId ||
                    transaction.reservation?.space.account.host.stripeAccountId;
                let amount =
                    transaction.hotelRoomReservation?.subscriptionPrice || transaction.reservation?.subscriptionPrice;
                const reservationId = transaction.hotelRoomReservation?.id || transaction.reservation?.id;
                amount = Math.floor(amount * 0.9);
                await stripe.transferToConnect(destination, amount, reservationId);
            }
        } catch (error) {
            ForceLog("FAILED: capturing amount");
            ForceLog(error);
        }
        return;
    }

    Log("INVALID ACTION");
};

export const main = middy(transactionQueueWorker).use(doNotWaitForEmptyEventLoop());
