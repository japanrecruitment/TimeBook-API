import * as ZBEmailVerifier from "zb-email-verifier";
import { Log } from "@utils/index";

export const validateEmail = (email: string) => {
    Log(`[STARTED] validating email ${email}`);
    const regex =
        /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    const isValid = regex.test(email.toLowerCase());
    Log(`[${isValid ? `COMPLETED` : `FAILED`}] validating email ${email}`);
    return isValid;
};

export const validateEmailOnCertainDomain = (email: string) => {
    Log(`[STARTED] validating email on certain domain ${email}`);
    const regex = /^[^@]+@(yahoo|ymail|rocketmail|pocketseq)\.(com|in|co\.uk|co\.jp)$/i;
    const isValid = regex.test(email);
    Log(`[${isValid ? `COMPLETED` : `FAILED`}] validating email on certain domain ${email}`);
    return isValid;
};

export const verifyEmailViaSMTP = async (email: string) => {
    try {
        Log(`[STARTED] verifying email via SMTP ${email}`);
        if (!email) return false;
        const result = await ZBEmailVerifier.verify({
            helo: "japanrecruitment.co.jp",
            from: "info@japanrecruitment.co.jp",
            to: email,
            catchalltest: true, // default false
            timeout: 5000, // default 5000
        });
        // CATCH_ALL means the mail server accepts mail for any address at that
        // domain, so SMTP can't confirm/deny the specific mailbox - treat it as
        // verified rather than dropping the email outright.
        const isVerified = result === "EXIST" || result === "CATCH_ALL";
        if (result === "CATCH_ALL") {
            Log(`[CATCH_ALL] verifying email via SMTP ${email} - domain accepts all mail, treating as verified`);
        }
        Log(`[${isVerified ? `COMPLETED` : `FAILED`}] verifying email via SMTP ${email}`, result);
        return isVerified;
    } catch (error) {
        Log(`[FAILED] verifying email via SMTP ${email}`, error);
        return false;
    }
};
