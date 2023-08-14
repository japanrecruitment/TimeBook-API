import { gql } from "apollo-server-core";
import { HostType, ProfileType, Role } from "@prisma/client";
import { RegisterUserInput } from "../profile/registerUser";
import { RegisterCompanyInput } from "../profile/registerCompany";
import { IFieldResolver } from "@graphql-tools/utils";
import { Context } from "../../../context";
import { GqlError } from "../../../error";
import { Result } from "../../core/result";
import {
    Log,
    encodePassword,
    randomNumberOfNDigits,
    addEmailToQueue,
    EmailVerificationData,
    HostRegisterNotificationData,
} from "@utils/index";
import { StripeLib } from "@libs/index";

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
    if (!isValid) throw new GqlError({ code: "BAD_USER_INPUT", message: "必要な情報を入力してください。" });

    const account = await store.account.findUnique({ where: { email } });
    if (account) throw new GqlError({ code: "BAD_USER_INPUT", message: "すでに登録されたメール。" });

    password = encodePassword(password);
    email = email.toLocaleLowerCase(); // change email to lowercase
    // register to stripe
    // update stripe account ID
    const stripe = new StripeLib();
    const { id: connectId } = await stripe.createConnectAccount({ email });

    const newAccount = await store.account.create({
        data: {
            email,
            password,
            profileType: ProfileType.CompanyProfile,
            roles: [Role.host],
            companyProfile: { create: { name, nameKana, registrationNumber } },
            approved: false,
            host: { create: { type: "Corporate", name, stripeAccountId: connectId, approved: false } },
        },
    });

    const verificationCode = randomNumberOfNDigits(6);
    await Promise.all([
        dataSources.redis.store(`email-verification-code-${email}`, verificationCode, 600),
        addEmailToQueue<EmailVerificationData>({
            template: "email-verification",
            recipientEmail: email,
            recipientName: name,
            verificationCode,
        }),
        addEmailToQueue<HostRegisterNotificationData>({
            template: "host-registration-notification",
            recipientEmail: "support@pocketseq.com",
            recipientName: "PocketseQ",
            customerType: "法人",
            name,
            email,
        }),
    ]);

    return {
        message: `ホストの登録が成功しました。`,
        action: `verify-email`,
    };
};

const registerIndividualHost: RegisterHostStrategy<RegisterUserInput> = async (input, { store, dataSources }) => {
    let { email, password, firstName, lastName, firstNameKana, lastNameKana } = input;

    const isValid = email?.trim() && password?.trim() && firstName?.trim() && lastName?.trim();
    if (!isValid) throw new GqlError({ code: "BAD_USER_INPUT", message: "必要な情報を入力してください。" });

    const account = await store.account.findUnique({ where: { email } });
    Log(account);
    if (account) throw new GqlError({ code: "BAD_USER_INPUT", message: "すでに登録されたメール。" });

    password = encodePassword(password);
    email = email.toLocaleLowerCase(); // change email to lowercase

    // register to stripe
    // update stripe account ID
    const stripe = new StripeLib();
    const { id: connectId } = await stripe.createConnectAccount({ email });

    const newAccount = await store.account.create({
        data: {
            email,
            password,
            profileType: ProfileType.UserProfile,
            roles: [Role.host],
            userProfile: { create: { firstName, lastName, firstNameKana, lastNameKana } },
            approved: false,
            host: {
                create: {
                    type: "Individual",
                    name: `${lastName} ${firstName}`,
                    stripeAccountId: connectId,
                    approved: false,
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
            recipientName: `${lastName} ${firstName}`,
            verificationCode,
        }),
        addEmailToQueue<HostRegisterNotificationData>({
            template: "host-registration-notification",
            recipientEmail: "support@pocketseq.com",
            recipientName: "PocketseQ",
            customerType: "個人",
            name: `${lastName} ${firstName}`,
            email,
        }),
    ]);

    return {
        message: `ホストの登録が成功しました。`,
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
