import { IFieldResolver } from "@graphql-tools/utils";
import { addEmailToQueue, ContactFormData, ResetPasswordData } from "@utils/email-helper";
import { Log } from "@utils/logger";
import { gql } from "apollo-server-core";
import { Context } from "../../context";
import { Result } from "../core/result";

export type ContactFormInput = {
    customerType: string;
    email: string;
    inquiryType: string;
    subject: string;
    description: string;
};

type ContactForm = IFieldResolver<any, Context, ContactFormInput, Promise<Result>>;

const contactForm: ContactForm = async (_, { customerType, email, inquiryType, subject, description }, __) => {
    customerType = customerType.trim();
    email = email.trim().toLocaleLowerCase();
    inquiryType = inquiryType.trim();
    subject = subject.trim();
    description = description.trim();

    // contact form email destination
    // const recipientEmail = "info@pocketseq.com";
    const recipientEmail = "ghale.avinash@gmail.com";
    const recipientName = "PocketSeq サポート";
    Log("[STARTED]: adding to queue");

    const contactFormData = {
        template: "contact-form",
        recipientEmail,
        recipientName,
        customerType,
        email,
        inquiryType,
        subject,
        description,
    };
    await addEmailToQueue<ContactFormData>({
        template: "contact-form",
        recipientEmail,
        recipientName,
        customerType,
        email,
        inquiryType,
        subject,
        description,
    });

    return {
        message: `We have received your support/contact request. We will get back to you as soon as possible.`,
        action: "",
    };
};

export const contactFormTypeDefs = gql`
    type Mutation {
        contactForm(
            customerType: String!
            email: String!
            inquiryType: String!
            subject: String!
            description: String!
        ): Result!
    }
`;

export const contactFormResolvers = {
    Mutation: { contactForm },
};
