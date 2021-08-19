import { Account, Company, PrismaClient, User } from "@prisma/client";
import { algolia, Algolia } from "@utils/algolia";
import { store } from "@utils/store";
import { decodeToken } from "@utils/token-helper";
import { DataSources } from "./dataSources";
import { GqlError } from "./error";

export type Context = {
    store: PrismaClient;
    algolia: Algolia;
    sourceIp: string;
    userAgent: string;
    dataSources?: DataSources;
    authData: Pick<Account, "email" | "phoneNumber" | "roles" | "profileType"> & Partial<User & Company>;
};

const getAuthData = (event) => {
    try {
        return decodeToken(event.headers.Authorization, "access") || { roles: ["unknown"] };
    } catch (error) {
        const code = "FORBIDDEN";
        const message = error.name === "TokenExpiredError" ? "Token expired" : "Invalid token";
        const action = error.name === "TokenExpiredError" ? "refresh-token" : "logout";
        throw new GqlError({ code, message, action });
    }
};

export default ({ event }): Context => {
    const { sourceIp, userAgent } = event.requestContext.identity;

    const authData = getAuthData(event);

    return {
        store,
        algolia,
        sourceIp,
        userAgent,
        authData,
    };
};
