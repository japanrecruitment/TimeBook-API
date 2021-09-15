import { Account, Company, PrismaClient, User } from "@prisma/client";
import { algolia, Algolia } from "@utils/algolia";
import { store } from "@utils/store";
import { DataSources } from "./dataSources";

export type Context = {
    event: any;
    store: PrismaClient;
    algolia: Algolia;
    sourceIp: string;
    userAgent: string;
    dataSources?: DataSources;
    authData?: Pick<Account, "email" | "phoneNumber" | "roles" | "profileType"> & Partial<User & Company>;
};

export default ({ event }): Context => {
    const { sourceIp, userAgent } = event.requestContext.identity;

    return {
        event,
        store,
        algolia,
        sourceIp,
        userAgent,
    };
};
