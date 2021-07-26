import { SQSHandler } from "aws-lambda";
import { middyfy } from "@middlewares/index";
import {
    EmailQueueData,
    emailTemplates,
    sendEmail,
    validateEmail,
    validateEmailOnCertainDomain,
    verifyEmailViaSMTP,
} from "@utils/email-helper";
import { Log } from "@utils/logger";

const emailQueueWorker: SQSHandler = async (event) => {
    if (event.Records.length === 0) return;
    const emailQueueData: EmailQueueData = JSON.parse(event.Records[0].body);
    const { template, ...emailData } = emailQueueData;

    Log(emailQueueData);
    const { to, subject, body } = emailTemplates[template](emailData as any);
    Log(to, subject, body);

    if (!validateEmail(to)) return;
    if (!validateEmailOnCertainDomain(to)) return;
    if (!verifyEmailViaSMTP(to)) return;

    await sendEmail(to, subject, body);
};

export const main = middyfy(emailQueueWorker, true);
