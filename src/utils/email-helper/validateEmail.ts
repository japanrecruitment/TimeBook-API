import ZBEmailVerifier from "zb-email-verifier";
import { Log } from "@utils/index";

export const validateEmail = (email: string) => {
    const regex =
        /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    const isValid = regex.test(email.toLowerCase());
    Log(isValid);
    return isValid;
};

export const validateEmailOnCertainDomain = (email: string) => {
    const regex = /^[^@]+@(yahoo|ymail|rocketmail)\.(com|in|co\.uk|co\.jp)$/i;
    const isValid = regex.test(email);
    Log(isValid);
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
        Log(`[COMPLETED] verifying email via SMTP ${email}`);
        return result === "EXIST";
    } catch (error) {
        Log(`[FAILED] verifying email via SMTP ${email}`);
        return false;
    }
};
