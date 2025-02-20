import { environment } from "@utils/environment";
import { Log } from "@utils/logger";
import { store } from "@utils/store";
import AWS from "aws-sdk";
import moment from "moment";

const SQS = new AWS.SQS({ apiVersion: "2012-11-05", region: "ap-northeast-1" });

const reauthTransactions = async (event) => {
    try {
        const sub6Days = new Date(moment().subtract(6, "days").format("YYYY/MM/DD"));
        const sub29Days = new Date(moment().subtract(29, "days").format("YYYY/MM/DD"));
        const transactions = await store.transaction.findMany({
            where: {
                AND: [
                    {
                        OR: [
                            {
                                brand: "amex",
                                lastAuthorizedDate: { equals: sub6Days },
                            },
                            {
                                brand: {
                                    in: ["diners", "discover", "jcb", "mastercard", "unionpay", "visa", "unknown"],
                                },
                                lastAuthorizedDate: { equals: sub29Days },
                            },
                        ],
                    },
                    { OR: [{ status: { not: "CANCELED" } }, { status: { not: "FAILED" } }] },
                ],
            },
            select: { id: true },
        });

        const fromDate = moment().startOf("day").toDate();
        const toDate = moment().endOf("day").toDate();
        const reservations = await store.reservation.findMany({
            where: {
                AND: [
                    { fromDateTime: { gte: fromDate } },
                    { fromDateTime: { lte: toDate } },
                    { OR: [{ status: { not: "CANCELED" } }, { status: { not: "FAILED" } }] },
                ],
            },
            select: { id: true, transaction: { select: { id: true } } },
        });
        const hotelReservations = await store.hotelRoomReservation.findMany({
            where: {
                AND: [
                    { fromDateTime: { gte: fromDate } },
                    { fromDateTime: { lte: toDate } },
                    { OR: [{ status: { not: "CANCELED" } }, { status: { not: "FAILED" } }] },
                ],
            },
            select: { id: true, transaction: { select: { id: true } } },
        });
        const captureTransactions = reservations
            .map(({ transaction }) => transaction)
            .concat(hotelReservations.map(({ transaction }) => transaction));

        Log("checkTransaction", transactions);
        Log("checkCaptureTransaction", captureTransactions);

        for (const transaction of transactions) {
            const body = { action: "reauthorize", transaction };
            const result = await SQS.sendMessage({
                DelaySeconds: 0,
                QueueUrl: environment.TRANSACTION_QUEUE,
                MessageBody: JSON.stringify(body),
            }).promise();
            Log(transaction.id, result);
        }

        for (const transaction of captureTransactions) {
            const body = { action: "capture", transaction };
            const result = await SQS.sendMessage({
                DelaySeconds: 0,
                QueueUrl: environment.TRANSACTION_QUEUE,
                MessageBody: JSON.stringify(body),
            }).promise();
            Log(transaction.id, result);
        }
    } catch (error) {
        Log(error.message);
    }
};

export const main = reauthTransactions;
