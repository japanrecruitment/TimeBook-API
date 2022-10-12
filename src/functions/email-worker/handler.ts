import { SQSHandler } from "aws-lambda";
import {
    EmailQueueData,
    emailTemplates,
    sendEmail,
    validateEmail,
    validateEmailOnCertainDomain,
    verifyEmailViaSMTP,
} from "@utils/email-helper";
import { Log } from "@utils/logger";
import middy from "@middy/core";
import doNotWaitForEmptyEventLoop from "@middy/do-not-wait-for-empty-event-loop";

const emailQueueWorker: SQSHandler = async (event) => {
    Log(`[STARTED]: EMAIL WORKER`);
    Log(event);
    if (event.Records.length === 0) return;
    const emailQueueData: EmailQueueData = JSON.parse(event.Records[0].body);
    const { template, ...emailData } = emailQueueData;

    Log(emailQueueData);
    // TODO: get necessary details for email body

    const { to, subject, body } = emailTemplates[template](emailData as any);

    if (!validateEmail(to)) return;
    if (!validateEmailOnCertainDomain(to) && !(await verifyEmailViaSMTP(to))) return;

    await sendEmail(to, subject, body);
    Log(`[FINISHED]: EMAIL WORKER`);
};

export const main = middy(emailQueueWorker).use(doNotWaitForEmptyEventLoop());
