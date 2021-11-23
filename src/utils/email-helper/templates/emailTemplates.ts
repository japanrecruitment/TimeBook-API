import emailVerification from "./email-verification";
import resetPassword from "./reset-password";
import passwordChanged from "./password-changed";
import profileUpdated from "./profile-updated";
import hostApplicationReceived from "./host-application-received";
import hostApplicationRejected from "./host-application-rejected";
import hostApplicationApproved from "./host-application-approved";

export const emailTemplates = {
    "email-verification": emailVerification,
    "reset-password": resetPassword,
    "password-changed": passwordChanged,
    "profile-updated": profileUpdated,
    "host-application-received": hostApplicationReceived,
    "host-application-rejected": hostApplicationRejected,
    "host-application-approved": hostApplicationApproved,
};

export type EmailTemplates = keyof typeof emailTemplates;
