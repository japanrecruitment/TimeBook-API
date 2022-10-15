import emailVerification from "./email-verification";
import resetPassword from "./reset-password";
import passwordChanged from "./password-changed";
import profileUpdated from "./profile-updated";
import hostApplicationReceived from "./host-application-received";
import hostApplicationRejected from "./host-application-rejected";
import hostApplicationApproved from "./host-application-approved";
import reservationReceived from "./reservation-received";
import reservationCompleted from "./reservation-completed";
import reservationFailed from "./reservation-failed";
import reservationPending from "./reservation-pending";
import contactForm from "./contact-form";

export const emailTemplates = {
    "email-verification": emailVerification,
    "reset-password": resetPassword,
    "password-changed": passwordChanged,
    "profile-updated": profileUpdated,
    "host-application-received": hostApplicationReceived,
    "host-application-rejected": hostApplicationRejected,
    "host-application-approved": hostApplicationApproved,
    "reservation-received": reservationReceived,
    "reservation-completed": reservationCompleted,
    "reservation-failed": reservationFailed,
    "reservation-pending": reservationPending,
    "contact-form": contactForm,
};

export type EmailTemplates = keyof typeof emailTemplates;
