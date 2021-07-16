import { AuthenticatedUser } from "@libs/authorizer";
import { PrismaClient } from "@prisma/client";
import { DataSources } from "./dataSources";

export type Context = {
    store: PrismaClient;
    sourceIp: string;
    userAgent: string;
    dataSources?: DataSources;
    principal: AuthenticatedUser;
};

const store = new PrismaClient();

export default ({ event }): Context => {
    const { sourceIp, userAgent } = event.requestContext.identity;

    const principal = new AuthenticatedUser(event);

    return {
        store,
        sourceIp,
        userAgent,
        principal,
    };
};
