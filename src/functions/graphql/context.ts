import { UserRole } from "@libs/authorizer";
import { Company, PrismaClient, User } from "@prisma/client";
import { decodeToken } from "@utils/token-helper";
import { DataSources } from "./dataSources";
import { GqlError } from "./error";

export type Context = {
    store: PrismaClient;
    sourceIp: string;
    userAgent: string;
    dataSources?: DataSources;
    authData: { roles: UserRole[] } & Partial<User & Company>;
};

const store = new PrismaClient();

const getAuthData = (event) => {
    try {
        return decodeToken(event.headers.authorization, "access") || { roles: ["unknown"] };
    } catch (error) {
        const code = "FORBIDDEN";
        const message = error.name === "TokenExpiredError" ? "Token expired" : "Invalid token";
        const action = error.name === "TokenExpiredError" ? "refresh-token" : "login";
        throw new GqlError({ code, message, action });
    }
};

export default ({ event, context }): Context => {
    console.log(event);
    console.log(context);

    const { sourceIp, userAgent } = event.requestContext.identity;

    const authData = getAuthData(event);

    return {
        store,
        sourceIp,
        userAgent,
        authData,
    };
};
