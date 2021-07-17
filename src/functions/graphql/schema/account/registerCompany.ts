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

type RegisterCompanyInput = {
    email: string;
    password: string;
    name: string;
    nameKana: string;
    registrationNumber: string;
};

type RegisterCompany = IFieldResolver<any, Context, Record<"input", RegisterCompanyInput>, Promise<Result>>;

const registerCompany: RegisterCompany = async (_, { input }, { store, dataSources }) => {
    let { email, password, name, nameKana, registrationNumber } = input;

    const isValid = email.trim() && password.trim() && name.trim() && nameKana.trim() && registrationNumber.trim();
    if (!isValid) throw new GqlError({ code: "BAD_USER_INPUT", message: "Provide all neccessary fields" });

    const account = await store.account.findUnique({ where: { email } });
    if (account) throw new GqlError({ code: "BAD_USER_INPUT", message: "Email already in use" });

    password = encodePassword(password);

    const newAccount = await store.account.create({
        data: {
            email,
            password,
            roles: [Role.user],
            companyProfile: { create: { name, nameKana, registrationNumber } },
        },
    });

    Log(newAccount);

    const verificationCode = randomNumberOfNDigits(6);
    dataSources.cacheDS.storeInCache(`email-verification-code-${email}`, verificationCode, 600);
    await addEmailToQueue<EmailVerificationData>({
        template: "email-verification",
        recipientEmail: email,
        recipientName: name,
        verificationCode,
    });

    return {
        message: `Successfully registered a company account with email: ${email}`,
        action: `verify-email`,
    };
};

export const registerCompanyTypeDefs = gql`
    input RegisterCompanyInput {
        email: String!
        password: String!
        name: String!
        nameKana: String!
        registrationNumber: String!
    }

    type Mutation {
        registerCompany(input: RegisterCompanyInput!): Result
    }
`;

export const registerCompanyResolvers = {
    Mutation: { registerCompany },
};
