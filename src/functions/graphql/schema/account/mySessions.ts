import { IFieldResolver } from "@graphql-tools/utils";
import { Session } from "@prisma/client";
import { Log } from "@utils/logger";
import { gql } from "apollo-server-core";
import { mapSelections, toPrismaSelect } from "graphql-map-selections";
import { Context } from "../../context";

type MySessions = IFieldResolver<any, Context, Record<string, any>, Promise<Partial<Session>[]>>;

const mySessions: MySessions = async (_, __, { authData, store }, info) => {
    const select = toPrismaSelect(mapSelections(info));
    const { accountId } = authData;

    let sessions = await store.session.findMany({
        where: { accountId },
        ...select,
    });

    Log(sessions);
    if (!sessions) return [];

    return sessions;
};

export const mySessionsTypeDefs = gql`
    type IpData {
        id: ID!
        city: String
        country: String
        countryCode: String
    }

    type Session {
        id: ID!
        userAgent: String
        createdAt: Date
        ipData: [IpData]
    }

    type Query {
        mySessions: [Session] @auth(requires: [user, host])
    }
`;

export const mySessionsResolvers = {
    Query: { mySessions },
};
