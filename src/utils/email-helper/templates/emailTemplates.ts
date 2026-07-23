import emailVerification from "./email-verification";
import resetPassword from "./reset-password";
import passwordChanged from "./password-changed";
import profileUpdated from "./profile-updated";
import hostApplicationReceived from "./host-application-received";
import hostApplicationRejected from "./host-application-rejected";
import hostApplicationApproved from "./host-application-approved";
import reservationReceived from "./reservation-received";
import reservationReceivedUser from "./reservation-received-user";
import reservationCompleted from "./reservation-completed";
import reservationCompletedUser from "./reservation-completed-user";
import reservationFailed from "./reservation-failed";
import reservationPending from "./reservation-pending";
import reservationCancelledUser from "./reservation-cancelled-user";
import contactForm from "./contact-form";
import hostRegistrationNotification from "./host-registration-notification";
import accountDeactivated from "./account-deactivated";

export const emailTemplates = {
    "email-verification": emailVerification,
    "reset-password": resetPassword,
    "password-changed": passwordChanged,
    "profile-updated": profileUpdated,
    "host-application-received": hostApplicationReceived,
    "host-application-rejected": hostApplicationRejected,
    "host-application-approved": hostApplicationApproved,
    "reservation-received": reservationReceived,
    "reservation-received-user": reservationReceivedUser,
    "reservation-completed": reservationCompleted,
    "reservation-completed-user": reservationCompletedUser,
    "reservation-failed": reservationFailed,
    "reservation-pending": reservationPending,
    "reservation-cancelled-user": reservationCancelledUser,
    "contact-form": contactForm,
    "host-registration-notification": hostRegistrationNotification,
    "account-deactivated": accountDeactivated,
};

export type EmailTemplates = keyof typeof emailTemplates;
