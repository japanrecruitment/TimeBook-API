import { IFieldResolver } from "@graphql-tools/utils";
import { encodePassword } from "@utils/authUtils";
import { gql } from "apollo-server-core";
import { Context } from "../../context";
import { GqlError } from "../../error";
import { Result } from "../core/result";
import { addEmailToQueue, PasswordChangeEmailData } from "@utils/email-helper";

type ResetPasswordInput = {
    email: string;
    newPassword: string;
    code: number;
};

type ResetPassword = IFieldResolver<any, Context, Record<"input", ResetPasswordInput>, Promise<Result>>;

const resetPassword: ResetPassword = async (_, { input }, { store, dataSources }) => {
    let { email, newPassword, code } = input;

    email = email.toLocaleLowerCase(); // change email to lower case

    const cacheCode = await dataSources.redis.fetch(`reset-password-verification-code-${email}`);
    if (cacheCode !== code) throw new GqlError({ code: "FORBIDDEN", message: "コードの有効期限が切れました。" });

    const account = await store.account.update({ where: { email }, data: { password: encodePassword(newPassword) } });
    if (!account)
        throw new GqlError({ code: "NOT_FOUND", message: "メールアドレスまたはパスワードが間違っています。" });

    dataSources.redis.delete(`reset-password-verification-code-${email}`);

    await addEmailToQueue<PasswordChangeEmailData>({
        template: "password-changed",
        recipientEmail: email,
        recipientName: "",
    });

    return {
        message: `パスワードが変更されました`,
        action: "login",
    };
};

export const resetPasswordTypeDefs = gql`
    input ResetPasswordInput {
        email: String!
        newPassword: String!
        code: Int!
    }

    type Mutation {
        resetPassword(input: ResetPasswordInput!): Result!
    }
`;

export const resetPasswordResolvers = {
    Mutation: { resetPassword },
};
