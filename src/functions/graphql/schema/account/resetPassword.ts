import { IFieldResolver } from "@graphql-tools/utils";
import { encodePassword } from "@utils/authUtils";
import { gql } from "apollo-server-core";
import { Context } from "../../context";
import { GqlError } from "../../error";
import { Result } from "../core/result";

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
    if (cacheCode !== code) throw new GqlError({ code: "FORBIDDEN", message: "Reset password code expired" });

    const account = await store.account.update({ where: { email }, data: { password: encodePassword(newPassword) } });
    if (!account) throw new GqlError({ code: "NOT_FOUND", message: "User with the given email not found" });

    dataSources.redis.delete(`reset-password-verification-code-${email}`);

    return {
        message: `Your password has been changed successfully. You can use your new password to login.`,
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
