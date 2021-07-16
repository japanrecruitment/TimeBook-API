import { IFieldResolver } from "@graphql-tools/utils";
import { Role } from "@prisma/client";
import { encodePassword } from "@utils/authUtils";
import { randomNumberOfNDigits } from "@utils/compute";
import { addEmailToQueue, EmailVerificationData } from "@utils/email-helper";
import { Log } from "@utils/logger";
import { gql } from "apollo-server-core";
import { Context } from "../../context";
import { GqlError } from "../../error";
import { Result } from "../core/result";

type RegisterUserInput = {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    firstNameKana: string;
    lastNameKana: string;
};

type RegisterUser = IFieldResolver<any, Context, Record<"input", RegisterUserInput>, Promise<Result>>;

const registerUser: RegisterUser = async (_, { input }, { store, dataSources }) => {
    let { email, password, firstName, lastName, firstNameKana, lastNameKana } = input;

    const isValid = email.trim() && password.trim() && firstName.trim() && lastName.trim();
    if (!isValid) throw new GqlError({ code: "BAD_USER_INPUT", message: "Provide all neccessary fields" });

    const account = await store.account.findUnique({ where: { email } });
    Log(account);
    if (account) throw new GqlError({ code: "BAD_USER_INPUT", message: "Email already in use" });

    password = encodePassword(password);

    const newAccount = await store.account.create({
        data: {
            email,
            password,
            roles: [Role.user],
            userProfile: { create: { email, firstName, lastName, firstNameKana, lastNameKana } },
        },
    });

    Log(newAccount);

    const verificationCode = randomNumberOfNDigits(6);
    dataSources.cacheDS.storeInCache(`email-verification-code-${email}`, verificationCode, 600);
    await addEmailToQueue<EmailVerificationData>({
        template: "email-verification",
        recipientEmail: email,
        recipientName: `${firstName} ${lastName}`,
        verificationCode,
    });

    return {
        message: `Successfully registered an user account with email: ${email}`,
        action: `verify-email`,
    };
};

export const registerUserTypeDefs = gql`
    input RegisterUserInput {
        email: String!
        password: String!
        firstName: String!
        lastName: String!
        firstNameKana: String!
        lastNameKana: String!
    }

    type Mutation {
        registerUser(input: RegisterUserInput!): Result!
    }
`;

export const registerUserResolvers = {
    Mutation: { registerUser },
};
