import { IFieldResolver } from "@graphql-tools/utils";
import { gql } from "apollo-server-core";
import { Context } from "../../context";

type MySessions = IFieldResolver<any, Context, Record<string, any>>;

const mySessions: MySessions = async (_, __, { authData, store }) => {
    const { accountId } = authData;

    let sessions = await store.session.findMany({
        where: { accountId },
        select: {
            id: true,
            userAgent: true,
            createdAt: true,
            ipData: { select: { id: true, city: true, country: true, countryCode: true } },
        },
    });

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
