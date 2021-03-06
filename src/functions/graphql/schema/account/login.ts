import { IFieldResolver } from "@graphql-tools/utils";
import { getIpData, Log, matchPassword, omit, pick, encodeToken } from "@utils/index";
import { gql } from "apollo-server-core";
import { mapSelections } from "graphql-map-selections";
import { merge } from "lodash";
import { Context } from "../../context";
import { GqlError } from "../../error";
import { toHostSelect } from "./host/HostObject";
import { ProfileObject, toCompanyProfileSelect, toUserProfileSelect } from "./profile";

type LoginInput = {
    email: string;
    password: string;
};

type LoginResult = {
    profile: ProfileObject;
    accessToken: string;
    refreshToken: string;
};

type LoginArgs = { input: LoginInput };

type Login = IFieldResolver<any, Context, LoginArgs, Promise<LoginResult>>;

const login: Login = async (_, { input }, { store, sourceIp, userAgent }) => {
    let { email, password } = input;

    email = email.toLocaleLowerCase(); // change email to lowercase

    const isEmpty = !email.trim() || !password.trim();
    if (isEmpty) throw new GqlError({ code: "BAD_USER_INPUT", message: "Provide all neccessary fields" });

    const account = await store.account.findUnique({
        where: { email },
        include: { userProfile: true, companyProfile: true, host: true },
    });

    Log(account);
    if (!account) throw new GqlError({ code: "NOT_FOUND", message: "User not found" });

    const passwordMatched = matchPassword(password, account.password);
    if (!passwordMatched) throw new GqlError({ code: "FORBIDDEN", message: "Incorrect email or password" });

    if (account.suspended)
        throw new GqlError({
            code: "FORBIDDEN",
            message: "Your account has been suspended. Please contact support team",
        });

    if (!account.emailVerified)
        throw new GqlError({ code: "FORBIDDEN", message: "Please verify email first", action: "verify-email" });

    let ipData = await getIpData(sourceIp);

    const session = await store.session.create({
        data: {
            userAgent,
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
};

export const loginTypeDefs = gql`
    input LoginInput {
        email: String!
        password: String!
    }

    type LoginResult {
        profile: Profile!
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
