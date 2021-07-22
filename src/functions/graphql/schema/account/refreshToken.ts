import { IFieldResolver } from "@graphql-tools/utils";
import { Log } from "@utils/logger";
import { decodeToken, encodeToken } from "@utils/token-helper";
import { gql } from "apollo-server-core";
import { Context } from "../../context";
import { GqlError } from "../../error";

type RefreshToken = IFieldResolver<any, Context, Record<"token", string>, Promise<string>>;

const refreshToken: RefreshToken = async (_, { token }, { authData, store }) => {
    try {
        const { accountId, jti: id } = decodeToken(token, "refresh");

        const session = await store.session.findFirst({
            where: { id, accountId },
            select: { id: true, accountId: true },
        });

        if (!session) throw new GqlError({ code: "NOT_FOUND", message: "Invalid token", action: "logout" });

        return encodeToken(authData, "access", { jwtid: accountId });
    } catch (error) {
        const message = error.name === "TokenExpiredError" ? "Session expired" : "Invalid token";
        throw new GqlError({ code: "FORBIDDEN", message, action: "logout" });
    }
};

export const refreshTokenTypeDefs = gql`
    type Mutation {
        refreshToken(token: String!): String!
    }
`;

export const refreshTokenResolvers = {
    Mutation: { refreshToken },
};
