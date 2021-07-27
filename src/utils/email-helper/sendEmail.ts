import { Log } from "@utils/logger";
import AWS from "aws-sdk";

const SES = new AWS.SES({ apiVersion: "2010-12-01", region: "ap-northeast-1" });

export const sendEmail = async (to: string, subject: string, body: string) => {
    try {
        Log("[STARTED] sending email");
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
        }).promise();
        Log("[COMPLETED] sending email");
        Log(to, result);
        return result;
    } catch (error) {
        Log("[FAILED] sending email");
        Log(error);
    }
};
