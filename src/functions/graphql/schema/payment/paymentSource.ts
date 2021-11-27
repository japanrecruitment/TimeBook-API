import { IFieldResolver } from "@graphql-tools/utils";
import { PaymentSource } from "@prisma/client";
import { Log } from "@utils/logger";
import { gql } from "apollo-server-core";
import { mapSelections, toPrismaSelect } from "graphql-map-selections";
import { Context } from "../../context";

type TPaymentSource = IFieldResolver<any, Context, Record<string, any>, Promise<Partial<PaymentSource>[]>>;

const paymentSource: TPaymentSource = async (_, __, { authData, store }, info) => {
    const select = toPrismaSelect(mapSelections(info));
    const { accountId } = authData;

    let paymentSources = await store.paymentSource.findMany({
        where: { accountId },
        ...select,
    });

    Log("PAYMENT SOURCE", paymentSources);
    if (!paymentSources) return [];

    return paymentSources;
};

export const paymentSourceTypeDefs = gql`
    type PaymentSource {
        id: ID!
        customer: String
        token: String
        type: String
        expMonth: Int
        expYear: Int
        last4: String
        brand: String
        country: String
    }

    type Query {
        paymentSource: [PaymentSource] @auth(requires: [user], allowSelf: true)
    }
`;

export const paymentSourceResolvers = {
    Query: { paymentSource },
};

export type PaymentMethod = {
    id: string | number;
    customer: string;
    token: string;
    type: string;
    expMonth: number;
    expYear: number;
    last4: string;
    brand: string;
    country: string;
};

export type PaymentMethodInput = {
    paymentMethodId: string;
};
