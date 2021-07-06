export type EmailData = {
    recipientEmail: string;
    recipientName: string;
};

const generateTemplate = <D extends EmailData = EmailData>(template: string, defaultSubject: string) => {
    return (emailData: D, emailSubject: string = defaultSubject) => ({
        to: emailData.recipientEmail,
        subject: emailSubject,
        body: Handlebars.compile(template)(emailData),
    });
};

export default generateTemplate;
