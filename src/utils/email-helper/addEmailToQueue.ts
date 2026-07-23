import { Log } from "@utils/logger";
import { EmailTemplates, emailTemplates } from "./templates/emailTemplates";
import { EmailData } from "./templates/generateTemplate";
import { sendEmail } from "./sendEmail";
import { validateEmail, validateEmailOnCertainDomain, verifyEmailViaSMTP } from "./validateEmail";

export type EmailQueueData<D extends EmailData = EmailData> = D & { template: EmailTemplates };

// NOTE: Emails are now rendered and sent directly from this process (EC2) instead of
// being pushed to SQS for the `email-worker` Lambda to render. The templates in
// ./templates are therefore applied at runtime here, so editing a template only
// requires redeploying this app — no `serverless deploy` of the email-worker Lambda.
export const addEmailToQueue = async <D extends EmailData = EmailData>(data: EmailQueueData<D>) => {
    try {
        Log("[STARTED]: Sending email");
        Log(data);

        const { template, ...emailData } = data;
        const { to, subject, body } = emailTemplates[template](emailData as any);

        if (!validateEmail(to)) return;
        if (!validateEmailOnCertainDomain(to) && !(await verifyEmailViaSMTP(to))) return;

        const result = await sendEmail(to, subject, body);
        Log("[COMPLETED]: Sending email");
        return result;
    } catch (error) {
        Log("[FAILED]: Sending email");
        Log(error);
    }
};
