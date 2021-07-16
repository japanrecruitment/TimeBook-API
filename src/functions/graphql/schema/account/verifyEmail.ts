import { IFieldResolver } from "@graphql-tools/utils";
import { Log } from "@utils/logger";
import { gql } from "apollo-server-core";
import { Context } from "../../context";
import { GqlError } from "../../error";
import { Result } from "../core/result";

type VerifyEmailInput = {
    email: string;
    code: number;
};

type VerifyEmail = IFieldResolver<any, Context, Record<"input", VerifyEmailInput>, Promise<Result>>;

const verifyEmail: VerifyEmail = async (_, { input }, { store, dataSources }) => {
    const { email, code } = input;

    const cacheCode = await dataSources.cacheDS.fetchFromCache(`email-verification-code-${email}`);
    if (cacheCode !== code) throw new GqlError({ code: "FORBIDDEN", message: "Verificaiton code expired" });

    const account = store.account.update({ where: { email }, data: { emailVerified: true } });
    if (!account) throw new GqlError({ code: "NOT_FOUND", message: "Account with the given email not found" });

    Log(account);

    return { message: `Your account has been verified`, action: "login" };
};

export const verifyEmailTypeDefs = gql`
    input VerifyEmailInput {
        email: String!
        code: Int!
    }

    type Mutation {
        verifyEmail(input: VerifyEmailInput): Result!
    }
`;

export const verifyEmailResolvers = {
    Mutation: { verifyEmail },
};
