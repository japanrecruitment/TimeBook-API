import Handlebars from "handlebars";

export type EmailData = {
    recipientEmail: string;
    recipientName: string;
    sentDate?: string;
};

const generateTemplate = <D extends EmailData = EmailData>(template: string, defaultSubject: string) => {
    return (emailData: D, emailSubject: string = defaultSubject) => ({
        to: emailData.recipientEmail,
        subject: emailData.sentDate
            ? `${Handlebars.compile(emailSubject)(emailData)} ${emailData.sentDate}`
            : Handlebars.compile(emailSubject)(emailData),
        body: Handlebars.compile(template)(emailData),
    });
};

export default generateTemplate;
