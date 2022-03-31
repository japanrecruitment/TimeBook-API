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
                OR: [
                    {
                        brand: "amex",
                        lastAuthorizedDate: { equals: sub6Days },
                    },
                    {
                        brand: { in: ["diners", "discover", "jcb", "mastercard", "unionpay", "visa", "unknown"] },
                        lastAuthorizedDate: { equals: sub29Days },
                    },
                ],
            },
            select: { id: true },
        });

        Log("checkTransaction", transactions);

        if (!transactions || transactions.length <= 0) return;

        for (const transaction of transactions) {
            const body = { action: "reauthorize", transaction };
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
