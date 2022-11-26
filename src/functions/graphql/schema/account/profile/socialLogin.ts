import { IFieldResolver } from "@graphql-tools/utils";
import { ProfileType, Role } from "@prisma/client";
import { randomNumberOfNDigits } from "@utils/compute";
import { encodeToken, omit, pick } from "@utils/index";
import { getIpData } from "@utils/ip-helper";
import { Log } from "@utils/logger";
import { verifySocialLogin, VerifySocialLoginResponse } from "@utils/social-login-helper";
import { gql } from "apollo-server-core";
import { merge } from "lodash";
import { Context } from "../../../context";
import { GqlError } from "../../../error";
import { ProfileObject } from "./ProfileObject";

export type SocialLoginInput = {
    provider: string;
    providerAccountId: string;
    id_token: string;
    deviceID?: string;
};

type LoginResult = {
    profile: ProfileObject;
    accessToken: string;
    refreshToken: string;
};

type SocialLogin = IFieldResolver<any, Context, Record<"input", SocialLoginInput>, Promise<LoginResult>>;

const socialLogin: SocialLogin = async (_, { input }, { store, sourceIp, userAgent }) => {
    let { provider, providerAccountId, id_token, deviceID } = input;

    Log("Started: social login");
    try {
        const socialAccount: VerifySocialLoginResponse = await verifySocialLogin({
            provider: "google",
            token: id_token,
        });
        if (!socialAccount) throw new GqlError({ code: "BAD_USER_INPUT", message: "Wrong credentials" });

        const { email, emailVerified, firstName, lastName, profilePhoto } = socialAccount;

        if (!emailVerified) throw new GqlError({ code: "BAD_USER_INPUT", message: "Your email is not verified" });

        const account = await store.account.findUnique({
            where: { provider_providerAccountId: { provider, providerAccountId } },
            include: { userProfile: true, companyProfile: true, host: true },
        });

        Log("EXISTING ACCOUNT FOR SOCIAL LOGIN", account);

        let newAccount = account;

        if (!account) {
            Log("CREATE NEW ACCOUNT");
            // check if account with email exists
            // attach with that account if email exists
            const existingAccount = await store.account.findUnique({
                where: { email },
                include: { userProfile: true, companyProfile: true, host: true },
            });

            if (existingAccount && existingAccount.roles[0] === "user") {
                // link to existing account
                Log("Link Existing Account");
                Log("EXISTING ACCOUNT", existingAccount);

                if (existingAccount.suspended)
                    throw new GqlError({
                        code: "FORBIDDEN",
                        message: "Your account has been suspended. Please contact support team",
                    });

                newAccount = await store.account.update({
                    where: { id: existingAccount.id },
                    data: {
                        emailVerified: true,
                        provider,
                        providerAccountId,
                    },
                    include: { userProfile: true, companyProfile: true, host: true },
                });
            } else {
                Log("Create New Account");
                // create new account
                newAccount = await store.account.create({
                    data: {
                        email,
                        emailVerified: true,
                        password: `${randomNumberOfNDigits(8)}`,
                        profileType: ProfileType.UserProfile,
                        roles: [Role.user],
                        userProfile: {
                            create: { firstName, lastName, firstNameKana: firstName, lastNameKana: lastName },
                        },
                    },
                    include: { userProfile: true, companyProfile: true, host: true },
                });
            }
            Log("NEW ACCOUNT FOR SOCIAL LOGIN", newAccount);
            // New Account login garne
        }

        if (newAccount.suspended)
            throw new GqlError({
                code: "FORBIDDEN",
                message: "Your account has been suspended. Please contact support team",
            });

        let ipData = await getIpData(sourceIp);

        const session = await store.session.create({
            data: {
                userAgent,
                deviceID,
                accountId: account.id,
                ipData: {
                    connectOrCreate: {
                        where: { ipAddress: sourceIp },
                        create: ipData,
                    },
                },
            },
        });

        let profile: ProfileObject = merge(
            pick(account, "email", "phoneNumber", "profileType", "roles"),
            account.userProfile || account.companyProfile
        );
        const accessToken = encodeToken({ accountId: account.id, ...profile }, "access", { jwtid: account.id });
        const refreshToken = encodeToken({ accountId: account.id }, "refresh", { jwtid: session.id });

        profile = merge(profile, omit(account, "userProfile", "companyProfile"));
        return { profile, accessToken, refreshToken };
    } catch (error) {
        throw new GqlError({ code: "INTERNAL_SERVER_ERROR", message: "Something went wrong" });
    }
};

export const socialLoginTypeDefs = gql`
    input SocialLoginInput {
        provider: String!
        providerAccountId: String!
        id_token: String!
        deviceID: String
    }

    type LoginResult {
        profile: Profile!
        accessToken: String!
        refreshToken: String!
    }

    type Mutation {
        socialLogin(input: SocialLoginInput!): LoginResult!
    }
`;

export const socialLoginResolvers = {
    Mutation: { socialLogin: socialLogin },
};
