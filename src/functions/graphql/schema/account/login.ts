import { IFieldResolver } from "@graphql-tools/utils";
import {
    getIpData,
    Log,
    matchPassword,
    omit,
    pick,
    encodeToken,
    expoSendNotification,
    environment,
} from "@utils/index";
import { gql } from "apollo-server-core";
import { merge } from "lodash";
import { Context } from "../../context";
import { GqlError } from "../../error";
import { ProfileObject, toCompanyProfileSelect, toUserProfileSelect } from "./profile";

type LoginInput = {
    email: string;
    password: string;
    deviceID?: string;
};

type LoginResult = {
    profile: ProfileObject;
    accessToken: string;
    refreshToken: string;
};

type LoginArgs = { input: LoginInput };

type Login = IFieldResolver<any, Context, LoginArgs, Promise<LoginResult>>;

const login: Login = async (_, { input }, { store, sourceIp, userAgent }) => {
    let { email, password, deviceID } = input;

    email = email.toLocaleLowerCase(); // change email to lowercase

    const isEmpty = !email.trim() || !password.trim();
    if (isEmpty) throw new GqlError({ code: "BAD_USER_INPUT", message: "必要な情報をすべて入力してください。" });

    const account = await store.account.findUnique({
        where: { email },
        include: { userProfile: true, companyProfile: true, host: true },
    });

    Log(account);
    if (!account)
        throw new GqlError({ code: "NOT_FOUND", message: "メールアドレスまたはパスワードが間違っています。" });

    const passwordMatched = matchPassword(password, account.password);
    if (!passwordMatched)
        throw new GqlError({ code: "FORBIDDEN", message: "メールアドレスまたはパスワードが間違っています。" });

    if (account.suspended)
        throw new GqlError({
            code: "FORBIDDEN",
            message: "あなたのアカウントは停止されました。 サポートチームにお問い合わせください。",
        });

    if (!account.emailVerified)
        throw new GqlError({
            code: "FORBIDDEN",
            message: "アカウントのメールアドレスが確認されていません。 まずメールを確認してください。",
            action: "verify-email",
        });

    if (account.deactivated) throw new GqlError({ code: "ACTIVE_ACCOUNT_NOT_FOUND", message: "User not found" });

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
    if (deviceID)
        expoSendNotification([{ tokens: [deviceID], body: `Welcome back to ${environment.APP_READABLE_NAME}` }]);

    profile = merge(profile, omit(account, "userProfile", "companyProfile"));
    return { profile, accessToken, refreshToken };
};

export const loginTypeDefs = gql`
    input LoginInput {
        email: String!
        password: String!
        deviceID: String
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
