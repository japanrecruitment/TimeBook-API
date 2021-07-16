import { IFieldResolver } from "@graphql-tools/utils";
import { gql } from "apollo-server-core";
import { Context } from "../../context";
import { GqlError } from "../../error";
import { Result } from "../core/result";

type ResetPasswordInput = {
    email: string;
    code: number;
};

type VerifyResetPasswordRequest = IFieldResolver<any, Context, Record<"input", ResetPasswordInput>, Promise<Result>>;

const verifyResetPasswordRequest: VerifyResetPasswordRequest = async (_, { input }, { dataSources }) => {
    const { email, code } = input;

    const cacheCode = await dataSources.cacheDS.fetchFromCache(`reset-password-verification-code-${email}`);
    if (cacheCode !== code) throw new GqlError({ code: "FORBIDDEN", message: "Reset password code expired" });

    return {
        message: `Your password has been changed successfully. You can use your new password to login.`,
        action: "login",
    };
};

export const verifyResetPasswordRequestTypeDefs = gql`
    input VerifyResetPasswordRequestInput {
        email: String!
        code: Int!
    }

    type Query {
        verifyResetPasswordRequest(input: VerifyResetPasswordRequestInput!): Result!
    }
`;

export const verifyResetPasswordRequestResolvers = {
    Query: { verifyResetPasswordRequest },
};
