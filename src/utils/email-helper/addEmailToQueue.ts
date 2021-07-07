import AWS from "aws-sdk";
import { environment } from "@utils/environment";
import { Log } from "@utils/logger";
import { EmailTemplates } from "./templates/emailTemplates";
import { EmailData } from "./templates/generateTemplate";

export type EmailQueueData<D extends EmailData = EmailData> = D & { template: EmailTemplates };

const SQS = new AWS.SQS({ apiVersion: "2012-11-05", region: "ap-northeast-1" });

export const addEmailToQueue = async <D extends EmailData = EmailData>(data: EmailQueueData<D>) => {
    try {
        console.log("[STARTED] adding to queue");
        Log(data);
        const result = await SQS.sendMessage({
            DelaySeconds: 0,
            QueueUrl: environment.EMAIL_QUEUE_URL,
            MessageBody: JSON.stringify(data),
        });
        console.log("[COMPLETED] adding to queue");
        Log(result);
        return result;
    } catch (error) {
        console.log("[COMPLETED] adding to queue");
        console.log(error);
    }
};
