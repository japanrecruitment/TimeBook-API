import { IFieldResolver } from "@graphql-tools/utils";
import { PaymentSource } from "@prisma/client";
import { gql } from "apollo-server-core";
import { Context } from "../../context";

type PaymentSources = IFieldResolver<any, Context, Record<string, any>, Promise<PaymentSource[]>>;

const paymentSources: PaymentSources = async (_, __, { store, dataSources, authData }) => {
    console.log("Auth data", authData);
    // return null;
    const { accountId } = authData;
    const cacheKey = `payment-source:${accountId}`;
    const cacheDoc = await dataSources.cacheDS.fetchFromCache(cacheKey);
    if (cacheDoc) return cacheDoc;
    const { paymentSource } = await store.account.findUnique({
        where: { id: accountId },
        include: { paymentSource: true },
    });
    dataSources.cacheDS.storeInCache(cacheKey, paymentSource, 600);
    return paymentSource;
};

export const paymentSourceTypeDefs = gql`
    type PaymentSource {
        id: ID!
        token: String!
        type: String!
        expMonth: Int!
        expYear: Int!
        last4: String!
        brand: String!
        country: String!
        customer: String! # Customer ID from Stripe
        createdAt: String!
        updatedAt: String!
    }

    type Query {
        paymentSources: [PaymentSource] @auth(requires: [user])
    }
`;

export const paymentSourceResolvers = {
    Query: { paymentSources },
};
