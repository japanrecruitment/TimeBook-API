import { gql } from "apollo-server-core";
import { HostType, ProfileType, Role } from "@prisma/client";
import { RegisterUserInput } from "./registerUser";
import { RegisterCompanyInput } from "./registerCompany";
import { IFieldResolver } from "@graphql-tools/utils";
import { Context } from "../../context";
import { GqlError } from "../../error";
import { Result } from "../core/result";
import { Log, encodePassword, randomNumberOfNDigits, addEmailToQueue, EmailVerificationData } from "@utils/index";
import { S3Lib, StripeLib } from "@libs/index";
import { ImageUploadInput, ImageUploadResult } from "../media";

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
            host: { create: { type: "Corporate", name, stripeAccountId: connectId, approved: true } },
        },
    });

    Log(newAccount);

    const verificationCode = randomNumberOfNDigits(6);
    await Promise.all([
        dataSources.redisDS.store(`email-verification-code-${email}`, verificationCode, 600),
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
        dataSources.redisDS.store(`email-verification-code-${email}`, verificationCode, 600),
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

type AddPhotoId = IFieldResolver<any, Context, Record<"input", ImageUploadInput>, Promise<ImageUploadResult>>;
const addPhotoId: AddPhotoId = async (_, { input }, { authData, store }, info) => {
    // check input
    const type = "General";
    const mime = input.mime || "image/jpeg";

    const { id } = authData;

    // add record in DB
    let updatedProfile;

    updatedProfile = await store.host.update({
        where: { id },
        data: {
            photoId: {
                create: {
                    mime,
                    type,
                },
            },
        },
        select: {
            photoId: true,
        },
    });

    const { photoId } = updatedProfile;

    const key = `${photoId.id}.${photoId.mime.split("/")[1]}`;

    // get signedURL
    const S3 = new S3Lib("upload");
    const signedURL = S3.getUploadUrl(key, mime, 60 * 10);

    return { type, mime, url: signedURL, key };
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
        addPhotoId(input: ImageUploadInput!): ImageUploadResult @auth(requires: [host])
    }
`;

export const registerHostResolvers = {
    Mutation: { registerHost, addPhotoId },
};
