// Load the SDK for JavaScript
import AWS from "aws-sdk";
import { environment } from "./environment";
import { Log } from "./logger";
const SQS = new AWS.SQS({ apiVersion: "2012-11-05", region: "ap-northeast-1" });

type EmailTemplate = "EMAIL_VERIFICATION" | "FORGOT_PASSWORD";

export interface EmailData {
    toEmail: string;
    template: EmailTemplate;
    args: object;
}

const Queue = {
    sendMessage: async (body: EmailData) => {
        console.log("[STARTED] adding to queue");
        const result = await SQS.sendMessage({
            DelaySeconds: 0,
            QueueUrl: environment.EMAIL_QUEUE_URL,
            MessageBody: JSON.stringify(body),
        });
        console.log("[COMPLETED] adding to queue");
        Log(result);
        return result;
    },
};

export default Queue;
