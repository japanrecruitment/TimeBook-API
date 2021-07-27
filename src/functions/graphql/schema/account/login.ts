import { IFieldResolver } from "@graphql-tools/utils";
import { matchPassword } from "@utils/authUtils";
import { getIpData } from "@utils/ip-helper";
import { Log } from "@utils/logger";
import { omit, pick } from "@utils/object-helper";
import { encodeToken } from "@utils/token-helper";
import { gql } from "apollo-server-core";
import { mapSelections, toPrismaSelect } from "graphql-map-selections";
import { merge } from "lodash";
import { Context } from "../../context";
import { GqlError } from "../../error";
import { Profile } from "./profile";

type LoginInput = {
    email: string;
    password: string;
};

type LoginResult = {
    profile: Profile;
    accessToken: string;
    refreshToken: string;
};

type LoginArgs = { input: LoginInput };

type Login = IFieldResolver<any, Context, LoginArgs, Promise<LoginResult>>;

const login: Login = async (_, { input }, { store, sourceIp, userAgent }, info) => {
    Log(input);
    const gqlSelect = mapSelections(info);
    const { UserProfile, CompanyProfile } = gqlSelect.profile || {};
    const userProfileSelect = toPrismaSelect(omit(UserProfile, "email", "phoneNumber")) || true;
    const companyProfileSelect = toPrismaSelect(omit(CompanyProfile, "email", "phoneNumber")) || true;

    const { email, password } = input;

    const isEmpty = !email.trim() || !password.trim();
    if (isEmpty) throw new GqlError({ code: "BAD_USER_INPUT", message: "Provide all neccessary fields" });

    const account = await store.account.findUnique({
        where: { email },
        include: { userProfile: userProfileSelect, companyProfile: companyProfileSelect },
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
            accountId: account.id,
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

    const profile = merge(
        pick(account, "email", "phoneNumber", "profileType", "roles"),
        account.userProfile || account.companyProfile
    );
    const accessToken = encodeToken(profile, "access", { jwtid: account.id });
    const refreshToken = encodeToken({ accountId: account.id }, "refresh", { jwtid: session.id });

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
