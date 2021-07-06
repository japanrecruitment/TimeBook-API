import { Log } from "@utils/logger";
import AWS from "aws-sdk";

const SES = new AWS.SES({ apiVersion: "2010-12-01", region: "ap-northeast-1" });

export const sendEmail = async (to: string, subject: string, body: string) => {
    try {
        console.log("[STARTED] sending email");
        Log(to);
        const result = await SES.sendEmail({
            Source: "eLearning JRG <info@japanrecruitment.co.jp>",
            ReplyToAddresses: ["eLearning JRG <info@japanrecruitment.co.jp>"],
            Destination: { ToAddresses: [to] },
            Message: {
                Subject: {
                    Charset: "UTF-8",
                    Data: subject,
                },
                Body: {
                    Html: {
                        Charset: "UTF-8",
                        Data: body,
                    },
                },
            },
        });
        console.log("[COMPLETED] sending email");
        Log(to, result);
        return result;
    } catch (error) {
        console.log("[FAILED] sending email");
        console.log(error);
    }
};
