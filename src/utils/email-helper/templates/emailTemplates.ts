import emailVerification from "./email-verification";
import resetPassword from "./reset-password";

export const emailTemplates = {
    "email-verification": emailVerification,
    "reset-password": resetPassword,
};

export type EmailTemplates = keyof typeof emailTemplates;
