import { IFieldResolver } from "@graphql-tools/utils";
import { matchPassword } from "@utils/authUtils";
import { getIpData } from "@utils/ip-helper";
import { JWT } from "@utils/jwtUtil";
import { Log } from "@utils/logger";
import { gql } from "apollo-server-core";
import { Context } from "../../context";
import { GqlError } from "../../error";
import { ProfileResult } from "./profile";

type LoginInput = {
    email: string;
    password: string;
};

type LoginResult = {
    profile: ProfileResult;
    accessToken: string;
    refreshToken: string;
};

type Login = IFieldResolver<any, Context, Record<"input", LoginInput>, Promise<LoginResult>>;

const login: Login = async (_, { input }, { store, sourceIp, userAgent }) => {
    const { email, password } = input;

    const isEmpty = !email.trim() || !password.trim();
    if (isEmpty) throw new GqlError({ code: "BAD_USER_INPUT", message: "Provide all neccessary fields" });

    Log(input);

    const account = await store.account.findUnique({
        where: { email },
        include: { userProfile: true, companyProfile: true },
    });
    Log(account);
    if (!account) throw new GqlError({ code: "NOT_FOUND", message: "User not found" });

    const passwordMatched = matchPassword(password, account.password);
    if (!passwordMatched) throw new GqlError({ code: "FORBIDDEN", message: "Incorrect email or password" });

    if (account.suspended) throw new GqlError({ code: "FORBIDDEN", message: "Please contact support team" });

    if (!account.emailVerified)
        throw new GqlError({ code: "FORBIDDEN", message: "Please verify email first", action: "verify-email" });

    const { city, country_code, country_name, ...ipData } = await getIpData(sourceIp);

    const session = await store.session.create({
        data: {
            userAgent,
            acountId: account.id,
            ipData: {
                connectOrCreate: {
                    where: { ipAddress: sourceIp },
                    create: {
                        ipAddress: sourceIp,
                        city,
                        countryCode: country_code,
                        country: country_name,
                        data: ipData,
                    },
                },
            },
        },
    });

    const profile = account.userProfile || account.companyProfile;
    const jwt = new JWT();
    const accessToken = jwt.sign(account.id, { ...profile, roles: account.roles }, "accessToken");
    const refreshToken = jwt.sign(session.id, { accountId: account.id }, "refreshToken");

    return { profile, accessToken, refreshToken };
};

export const loginTypeDefs = gql`
    input LoginInput {
        email: String!
        password: String!
    }

    type LoginResult {
        profile: ProfileResult!
        accessToken: String!
        refreshToken: String!
    }

    type Mutation {
        login(input: LoginInput!): LoginResult!
    }
`;

export const loginResolvers = {
    Mutation: { login },
};
