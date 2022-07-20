import { TransactionStatus } from "@prisma/client";
import { formatJSONResponse, ValidatedEventAPIGatewayProxyEvent } from "@libs/apiGateway";
import { StripeLib } from "@libs/paymentProvider";
import { store } from "@utils/store";
import { Log } from "@utils/logger";

type WebhookMetadata = {
    transactionId: string;
    reservationId: string;
    userId: string;
    transactionStatus: TransactionStatus;
    amount: number;
    currency: string;
    webhookStatusLog: any;
    isCanceled: boolean;
};

type WebhookSpaceMetadata = WebhookMetadata & {
    spaceId: string;
};

type WebhookHotelRoomMetadata = WebhookMetadata & {
    hotelRoomId: string;
};

const webhook: ValidatedEventAPIGatewayProxyEvent<any> = async (event) => {
    try {
        let transactionId: string;
        let reservationId: string;
        let userId: string;
        let hotelRoomId: string;
        let spaceId: string;
        let transactionStatus: TransactionStatus;
        let amount: number;
        let currency: string;
        let webhookStatusLog: any;
        let isCanceled: boolean;

        const stripe = new StripeLib();
        stripe.validateWebhook(event, {
            onSuccess(intent) {
                isCanceled = intent?.statement_descriptor?.startsWith("CANCEL");
                transactionId = intent?.metadata?.transactionId;
                reservationId = intent?.metadata?.reservationId;
                userId = intent?.metadata?.userId;
                hotelRoomId = intent?.metadata?.hotelRoomId;
                spaceId = intent?.metadata?.spaceId;
                transactionStatus = TransactionStatus.WEBHOOK_RECEIVED;
                amount = intent?.amount;
                currency = intent?.currency;
                webhookStatusLog = intent;
            },
            onUnhandledWebhook(intent) {
                isCanceled = intent?.statement_descriptor?.startsWith("CANCEL");
                transactionId = intent?.metadata?.transactionId;
                reservationId = intent?.metadata?.reservationId;
                userId = intent?.metadata?.userId;
                hotelRoomId = intent?.metadata?.hotelRoomId;
                spaceId = intent?.metadata?.spaceId;
                transactionStatus = TransactionStatus.FAILED;
                webhookStatusLog = intent;
            },
            onError() {},
        });
        Log("isCancelled: ", isCanceled);

        if (!transactionStatus) return formatJSONResponse(404, { message: "Signature verification failed." });

        if (transactionStatus === TransactionStatus.FAILED)
            return formatJSONResponse(200, { message: "Signature verification failed." });

        if (!transactionId || !reservationId || !userId || (!spaceId && !hotelRoomId))
            return formatJSONResponse(500, { message: "Could not validate transaction on our end." });

        if (hotelRoomId) {
            return await handleHotelRoomReservation({
                amount,
                currency,
                hotelRoomId,
                isCanceled,
                reservationId,
                transactionId,
                transactionStatus,
                userId,
                webhookStatusLog,
            });
        } else if (spaceId) {
            return await handleSpaceReservation({
                amount,
                currency,
                isCanceled,
                reservationId,
                spaceId,
                transactionId,
                transactionStatus,
                userId,
                webhookStatusLog,
            });
        }
    } catch (error) {
        Log(error.message);
        return formatJSONResponse(500, { message: error.message });
    }
};

async function handleHotelRoomReservation({
    amount,
    currency,
    hotelRoomId,
    isCanceled,
    reservationId,
    transactionId,
    webhookStatusLog,
}: WebhookHotelRoomMetadata) {
    const transaction = await store.transaction.findUnique({ where: { id: transactionId } });

    if (!transaction) return formatJSONResponse(404, { message: "Transaction not found." });

    const reservation = await store.hotelRoomReservation.findUnique({ where: { id: reservationId } });

    if (!reservation) return formatJSONResponse(404, { message: "Reservation not found." });

    if (transaction.status === TransactionStatus.SUCCESSFULL)
        return formatJSONResponse(500, { message: "Webhook already received." });

    await store.transaction.update({
        where: { id: transactionId },
        data: { status: "WEBHOOK_RECEIVED", webhookReceivedLog: webhookStatusLog },
    });

    if (
        !isCanceled &&
        (amount !== transaction.amount || currency.toLowerCase() !== transaction.currency.toLowerCase())
    ) {
        await store.transaction.update({
            where: { id: transactionId },
            data: { status: "FAILED", webhookRespondedLog: webhookStatusLog },
        });
        await store.hotelRoomReservation.update({ where: { id: reservationId }, data: { status: "FAILED" } });
        return formatJSONResponse(400, { message: "Could not validate webhook data with our record." });
    }

    const updatedReservation = await store.hotelRoomReservation.update({
        where: { id: reservationId },
        data: {
            status: isCanceled ? "CANCELED" : !reservation.approved ? "HOLD" : "RESERVED",
        },
        select: { id: true, approved: true, reserveeId: true, status: true, hotelRoomId: true, packagePlanId: true },
    });

    await store.transaction.update({
        where: { id: transactionId },
        data: { status: isCanceled ? "CANCELED" : "SUCCESSFULL", resultedLog: updatedReservation },
    });

    return formatJSONResponse(200, { message: "Operation successful." });
}

async function handleSpaceReservation({
    amount,
    currency,
    isCanceled,
    reservationId,
    spaceId,
    transactionId,
    webhookStatusLog,
}: WebhookSpaceMetadata) {
    const transaction = await store.transaction.findUnique({ where: { id: transactionId } });

    if (!transaction) return formatJSONResponse(404, { message: "Transaction not found." });

    const reservation = await store.reservation.findUnique({
        where: { id: reservationId },
        include: { space: true },
    });

    if (!reservation) return formatJSONResponse(404, { message: "Reservation not found." });

    if (transaction.status === TransactionStatus.SUCCESSFULL)
        return formatJSONResponse(500, { message: "Webhook already received." });

    await store.transaction.update({
        where: { id: transactionId },
        data: { status: "WEBHOOK_RECEIVED", webhookReceivedLog: webhookStatusLog },
    });

    if (
        !isCanceled &&
        (amount !== transaction.amount || currency.toLowerCase() !== transaction.currency.toLowerCase())
    ) {
        await store.transaction.update({
            where: { id: transactionId },
            data: { status: "FAILED", webhookRespondedLog: webhookStatusLog },
        });
        await store.reservation.update({ where: { id: reservationId }, data: { status: "FAILED" } });
        return formatJSONResponse(400, { message: "Could not validate webhook data with our record." });
    }

    const updatedReservation = await store.reservation.update({
        where: { id: reservationId },
        data: {
            status: isCanceled
                ? "CANCELED"
                : reservation.space.needApproval && !reservation.approved
                ? "HOLD"
                : "RESERVED",
        },
        select: { id: true, approved: true, reserveeId: true, status: true, spaceId: true },
    });

    await store.transaction.update({
        where: { id: transactionId },
        data: { status: isCanceled ? "CANCELED" : "SUCCESSFULL", resultedLog: updatedReservation },
    });

    return formatJSONResponse(200, { message: "Operation successful." });
}

export const main = webhook;
