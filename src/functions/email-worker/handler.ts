import AWS from "aws-sdk";
import { Handler } from "aws-lambda";
import { verify } from "zb-email-verifier";
import { middyfy } from "../../middlewares";
import Log from "@utils/logger";
// import { IEmailData } from "../../utils";
// import { emailDeliveryStatusModel as EmailDeliveryStatus } from "../../model";
// import { renderEmail } from "../../utils/emails";

const SES = new AWS.SES({ apiVersion: "2010-12-01", region: "ap-northeast-1" });

const emailQueueWorker: Handler = async (event) => {
    // if Records length is 0 then return

    if (event.Records.length === 0) {
        return true;
    }
    // worker messages can be obtained from event.Records
    const { toEmail, template, args } = JSON.parse(event.Records[0].body);

    let body = "";
    let subject = "";
    try {
        // TODO:Prepare email body with template & arguments
        // switch (template) {
        //     case "verificationCode":
        //         body = renderEmail({ toEmail, template, args });
        //         subject = `${args.code} is your email verification code`;
        //         break;
        //     case "forgotPassword":
        //         body = renderEmail({ toEmail, template, args });
        //         subject = `${args.code} is your password reset code`;
        //         break;
        //     default:
        //     // code block
        // }

        // const emailData = { toEmail, subject, body };

        // const previousEmailStatus = await EmailDeliveryStatus.findOne({
        //     email: toEmail,
        // });

        // const isEmailVerified = await verifyEmailSMTP(
        //     toEmail,
        //     previousEmailStatus
        // );
        // if (isEmailVerified && isEmailVerified.result) {
        //     await sendEmail(emailData);
        //     //add this email to db as whitelist if not previously whitelisted
        //     if (!previousEmailStatus) {
        //         await addEmailDeliveyStatus(toEmail, false);
        //     }
        // }

        Log(toEmail, template, args);

        return true;
    } catch (error) {
        //Email send failed blacklist this email
        await addEmailDeliveyStatus(toEmail, true, error);
        return true;
    }
};

export function sendEmail({ toEmail, subject, body }) {
    const emailParams = {
        Destination: {
            ToAddresses: [toEmail],
        },
        Message: {
            Body: {
                Html: {
                    Charset: "UTF-8",
                    Data: body,
                },
            },
            Subject: {
                Charset: "UTF-8",
                Data: subject,
            },
        },
        Source: "eLearning JRG <info@japanrecruitment.co.jp>",
        ReplyToAddresses: ["eLearning JRG <info@japanrecruitment.co.jp>"],
    };
    return SES.sendEmail(emailParams).promise();
}

// SMTP Verification Function
function verifyEmailSMTP(email: string, previousEmailStatus) {
    return new Promise<any>(async (resolve, reject) => {
        try {
            if (!previousEmailStatus) {
                const checkEmailFormat = validateEmail(email);
                if (!checkEmailFormat) {
                    await addEmailDeliveyStatus(
                        email,
                        true,
                        "Email validation failed"
                    );
                    resolve({
                        result: false,
                        message: "Email validation failed",
                    });
                } else {
                    //since we have not sent email to this user,check if it falls under certain domain
                    if (
                        /^[^@]+@(yahoo|ymail|rocketmail)\.(com|in|co\.uk|co\.jp)$/i.test(
                            email
                        )
                    ) {
                        resolve({
                            result: true,
                            message: "Email falls under certain domains",
                        });
                    }
                    //verify this email using zb-email-verifier
                    else {
                        const result = await verify({
                            helo: "japanrecruitment.co.jp",
                            from: "info@japanrecruitment.co.jp",
                            to: email,
                            catchalltest: true, // default false
                            timeout: 5000, // default 5000
                        });
                        console.log("SMTP Test result", result);

                        if (result === "EXIST") {
                            resolve({
                                result: true,
                                message: "Email verified",
                            });
                        }
                        //resolve as false and add to add to db for now
                        else {
                            await addEmailDeliveyStatus(email, true, result);
                            resolve({
                                result: false,
                                message: result,
                            });
                        }
                    }
                }
            } else {
                //if email is sent previously and is not blacklisted;nothing to check(verify email)
                if (previousEmailStatus && !previousEmailStatus.blackListed) {
                    resolve({
                        result: true,
                        message: "Email sent previously",
                    });
                }
                //This email was previously blacklisted
                else {
                    resolve({
                        result: false,
                        message: "This email is previously blacklisted.",
                    });
                }
            }
        } catch (err) {
            console.log(
                email,
                "email did not succeed SMTP test hence blacklisting."
            );
            await addEmailDeliveyStatus(email, true, err);
            resolve({
                result: false,
                message:
                    "Your email was not sent due to technical issue. Please contact support.",
            });
        }
    });
}

async function addEmailDeliveyStatus(
    email: string,
    blacklist: boolean,
    err = null
) {
    // const emailDeliveryStatus = new EmailDeliveryStatus({
    //     email: email,
    //     blackListed: blacklist,
    //     blackListedReason: err,
    // });
    // await emailDeliveryStatus.save();
}

function validateEmail(email: string) {
    var re =
        /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}

export const main = middyfy(emailQueueWorker, true);
