import { IFieldResolver } from "@graphql-tools/utils";
import { pick } from "@utils/object-helper";
import { decodeToken, encodeToken } from "@utils/token-helper";
import { gql } from "apollo-server-core";
import { merge } from "lodash";
import { Context } from "../../context";
import { GqlError } from "../../error";

type RefreshToken = IFieldResolver<any, Context, Record<"token", string>, Promise<string>>;

const refreshToken: RefreshToken = async (_, { token }, { store }) => {
    try {
        const { accountId, jti: id } = decodeToken(token, "refresh");

        const { account } = await store.session.findFirst({
            where: { id, accountId },
            select: { id: true, account: { include: { userProfile: true, companyProfile: true } } },
        });

        if (!account) throw new GqlError({ code: "NOT_FOUND", message: "Invalid token", action: "logout" });

        const profile = merge(
            pick(account, "email", "phoneNumber", "profileType", "roles"),
            account.userProfile || account.companyProfile
        );
        return encodeToken(profile, "access", { jwtid: accountId });
    } catch (error) {
        const message = error.name === "TokenExpiredError" ? "Session expired" : "Invalid token";
        throw new GqlError({ code: "FORBIDDEN", message, action: "logout" });
    }
};

export const refreshTokenTypeDefs = gql`
    type Query {
        refreshToken(token: String!): String!
    }
`;

export const refreshTokenResolvers = {
    Query: { refreshToken },
};
