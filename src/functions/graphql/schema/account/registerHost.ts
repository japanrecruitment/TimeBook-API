import { gql } from "apollo-server-core";
import { HostType, ProfileType, Role } from "@prisma/client";
import { RegisterUserInput } from "./registerUser";
import { RegisterCompanyInput } from "./registerCompany";
import { IFieldResolver } from "@graphql-tools/utils";
import { Context } from "../../context";
import { GqlError } from "../../error";
import { Result } from "../core/result";
import { encodePassword } from "@utils/authUtils";
import { Log } from "@utils/logger";
import { randomNumberOfNDigits } from "@utils/compute";
import { addEmailToQueue, EmailVerificationData } from "@utils/email-helper";
import { StripeUtil } from "@libs/index";

type RegisterHostStrategy<T = any> = (input: T, context: Context) => Promise<Result>;

type RegisterHostStrategies = { [T in HostType]: RegisterHostStrategy };

type RegisterHostInput = {
    company?: RegisterCompanyInput;
    hostType: HostType;
    user?: RegisterUserInput;
};

type RegisterHost = IFieldResolver<any, Context, Record<"input", RegisterHostInput>, Promise<Result>>;

const registerHost: RegisterHost = async (_, { input }, context) => {
    const { company, hostType, user } = input;

    return registerHostStrategies[hostType](company || user, context);
};

const registerCorporateHost: RegisterHostStrategy<RegisterCompanyInput> = async (input, { store, dataSources }) => {
    let { email, password, name, nameKana, registrationNumber } = input;

    const isValid = email?.trim() && password?.trim() && name?.trim() && nameKana?.trim() && registrationNumber?.trim();
    if (!isValid) throw new GqlError({ code: "BAD_USER_INPUT", message: "Provide all neccessary fields" });

    const account = await store.account.findUnique({ where: { email } });
    if (account) throw new GqlError({ code: "BAD_USER_INPUT", message: "Email already in use" });

    password = encodePassword(password);

    // register to stripe
    // update stripe account ID
    const stripe = new StripeUtil();
    const { id: connectId } = await stripe.createConnectAccount({ email });

    const newAccount = await store.account.create({
        data: {
            email,
            password,
            profileType: ProfileType.CompanyProfile,
            roles: [Role.host],
            companyProfile: { create: { name, nameKana, registrationNumber } },
            approved: true,
            host: { create: { type: "Corporate", name, stripeAccountId: connectId, approved: true } },
        },
    });

    Log(newAccount);

    const verificationCode = randomNumberOfNDigits(6);
    await Promise.all([
        dataSources.redis.store(`email-verification-code-${email}`, verificationCode, 600),
        addEmailToQueue<EmailVerificationData>({
            template: "email-verification",
            recipientEmail: email,
            recipientName: name,
            verificationCode,
        }),
    ]);

    return {
        message: `Successfully registered a corporate host account with email: ${email}`,
        action: `verify-email`,
    };
};

const registerIndividualHost: RegisterHostStrategy<RegisterUserInput> = async (input, { store, dataSources }) => {
    let { email, password, firstName, lastName, firstNameKana, lastNameKana } = input;

    const isValid = email?.trim() && password?.trim() && firstName?.trim() && lastName?.trim();
    if (!isValid) throw new GqlError({ code: "BAD_USER_INPUT", message: "Provide all neccessary fields" });

    const account = await store.account.findUnique({ where: { email } });
    Log(account);
    if (account) throw new GqlError({ code: "BAD_USER_INPUT", message: "Email already in use" });

    password = encodePassword(password);

    // register to stripe
    // update stripe account ID
    const stripe = new StripeUtil();
    const { id: connectId } = await stripe.createConnectAccount({ email });

    const newAccount = await store.account.create({
        data: {
            email,
            password,
            profileType: ProfileType.UserProfile,
            roles: [Role.host],
            userProfile: { create: { firstName, lastName, firstNameKana, lastNameKana } },
            approved: true,
            host: {
                create: {
                    type: "Individual",
                    name: `${firstName} ${lastName}`,
                    stripeAccountId: connectId,
                    approved: true,
                },
            },
        },
    });

    Log(newAccount);

    const verificationCode = randomNumberOfNDigits(6);
    await Promise.all([
        dataSources.redis.store(`email-verification-code-${email}`, verificationCode, 600),
        addEmailToQueue<EmailVerificationData>({
            template: "email-verification",
            recipientEmail: email,
            recipientName: `${firstName} ${lastName}`,
            verificationCode,
        }),
    ]);

    return {
        message: `Successfully registered an individual host account with email: ${email}`,
        action: `verify-email`,
    };
};

const registerHostStrategies: RegisterHostStrategies = {
    Corporate: registerCorporateHost,
    Individual: registerIndividualHost,
};

export const registerHostTypeDefs = gql`
    enum HostType {
        Individual
        Corporate
    }

    input RegisterHostInput {
        company: RegisterCompanyInput
        hostType: HostType!
        user: RegisterUserInput
    }

    type Mutation {
        registerHost(input: RegisterHostInput!): Result
    }
`;

export const registerHostResolvers = {
    Mutation: { registerHost },
};
