import { TransactionStatus } from "@prisma/client";
import { formatJSONResponse, ValidatedEventAPIGatewayProxyEvent } from "@libs/apiGateway";
import { StripeLib } from "@libs/paymentProvider";
import { store } from "@utils/store";
import { Log } from "@utils/logger";

const webhook: ValidatedEventAPIGatewayProxyEvent<any> = async (event) => {
    try {
        let transactionId: string;
        let reservationId: string;
        let userId: string;
        let spaceId: string;
        let transactionStatus: TransactionStatus;
        let amount: number;
        let currency: string;
        let webhookStatusLog: any;

        const stripe = new StripeLib();
        stripe.validateWebhook(event, {
            onSuccess(intent) {
                transactionId = intent?.metadata?.transactionId;
                reservationId = intent?.metadata?.reservationId;
                userId = intent?.metadata?.userId;
                spaceId = intent?.metadata?.spaceId;
                transactionStatus = TransactionStatus.WEBHOOK_RECEIVED;
                amount = intent?.amount;
                currency = intent?.currency;
                webhookStatusLog = intent;
            },
            onUnhandledWebhook(intent) {
                transactionId = intent?.metadata?.transactionId;
                reservationId = intent?.metadata?.reservationId;
                userId = intent?.metadata?.userId;
                spaceId = intent?.metadata?.spaceId;
                transactionStatus = TransactionStatus.FAILED;
                webhookStatusLog = intent;
            },
            onError() {},
        });

        if (!transactionStatus) return formatJSONResponse(404, { message: "Signature verification failed." });

        if (transactionStatus === TransactionStatus.FAILED)
            return formatJSONResponse(200, { message: "Signature verification failed." });

        if (!transactionId || !reservationId || !userId || !spaceId)
            return formatJSONResponse(500, { message: "Could not validate transaction on our end." });

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

        if (amount !== transaction.amount || currency.toLowerCase() !== transaction.currency.toLowerCase()) {
            await store.transaction.update({
                where: { id: transactionId },
                data: { status: "FAILED", webhookRespondedLog: webhookStatusLog },
            });
            await store.reservation.update({ where: { id: reservationId }, data: { status: "FAILED" } });
            return formatJSONResponse(400, { message: "Could not validate webhook data with our record." });
        }

        const updatedReservation = await store.reservation.update({
            where: { id: reservationId },
            data: { status: reservation.space.needApproval && !reservation.approved ? "HOLD" : "RESERVED" },
            select: { id: true, approved: true, reserveeId: true, status: true, spaceId: true },
        });

        await store.transaction.update({
            where: { id: transactionId },
            data: { status: "SUCCESSFULL", resultedLog: updatedReservation },
        });

        return formatJSONResponse(200, { message: "Operation successful." });
    } catch (error) {
        Log(error.message);
        return formatJSONResponse(500, { message: error.message });
    }
};

export const main = webhook;
