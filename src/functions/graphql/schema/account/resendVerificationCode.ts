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
    if (!account)
        throw new GqlError({ code: "NOT_FOUND", message: "メールアドレスまたはパスワードが間違っています。" });

    const verificationCode = randomNumberOfNDigits(6);
    dataSources.redis.store(`email-verification-code-${email}`, verificationCode, 600);
    await addEmailToQueue<EmailVerificationData>({
        template: "email-verification",
        recipientEmail: email,
        recipientName: "",
        verificationCode,
    });

    return { message: `確認コードが「${email}」に送信されました。 メールを確認してください。` };
};

export const resendVerificationCodeTypeDefs = gql`
    type Query {
        resendVerificationCode(email: String!): Result!
    }
`;

export const resendVerificationCodeResolvers = {
    Query: { resendVerificationCode },
};
