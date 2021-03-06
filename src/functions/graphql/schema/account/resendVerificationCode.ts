import { IFieldResolver } from "@graphql-tools/utils";
import { randomNumberOfNDigits } from "@utils/compute";
import { addEmailToQueue, EmailVerificationData } from "@utils/email-helper";
import { gql } from "apollo-server-core";
import { Context } from "../../context";
import { GqlError } from "../../error";
import { Result } from "../core/result";

type ResendVerificationCode = IFieldResolver<any, Context, Record<"email", string>, Promise<Result>>;

const resendVerificationCode: ResendVerificationCode = async (_, { email }, { store, dataSources }) => {
    email = email.toLocaleLowerCase(); // change email to lower case

    const account = await store.account.findUnique({ where: { email } });
    if (!account) throw new GqlError({ code: "NOT_FOUND", message: "User with the given email not found" });

    const verificationCode = randomNumberOfNDigits(6);
    dataSources.redis.store(`email-verification-code-${email}`, verificationCode, 600);
    await addEmailToQueue<EmailVerificationData>({
        template: "email-verification",
        recipientEmail: email,
        recipientName: "",
        verificationCode,
    });

    return { message: `Verificaiton code sent successfully to ${email}. Please check your email.` };
};

export const resendVerificationCodeTypeDefs = gql`
    type Query {
        resendVerificationCode(email: String!): Result!
    }
`;

export const resendVerificationCodeResolvers = {
    Query: { resendVerificationCode },
};
