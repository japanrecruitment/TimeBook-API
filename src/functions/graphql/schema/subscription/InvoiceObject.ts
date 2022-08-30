import { IObjectTypeResolver } from "@graphql-tools/utils";
import { gql } from "apollo-server-core";
import { Context } from "../../context";
import { SubscriptionObject } from "./SubscriptionObject";

export type InvoiceObject = {
    id: string;
    amountDue: number;
    amountPaid: number;
    amountRemaining: number;
    createdAt: Date;
    currency: string;
    paid: boolean;
    periodEnd: Date;
    periodStart: Date;
    status: string;
    subTotal: number;
    tax: number;
    total: number;
    subscription: Partial<SubscriptionObject>;
};

export const invoiceObjectTypeDefs = gql`
    type InvoiceObject {
        id: ID
        amountDue: Int
        amountPaid: Int
        amountRemaining: Int
        createdAt: Date
        currency: String
        paid: Boolean
        periodEnd: Date
        periodStart: Date
        status: String
        subTotal: Int
        tax: Int
        total: Int
        subscription: SubscriptionObject
    }
`;

export const invoiceObjectResolvers = {
    InvoiceObject: {
        createdAt: ({ createdAt }) => new Date(createdAt.getTime() * 1000),
        periodEnd: ({ periodEnd }) => new Date(periodEnd.getTime() * 1000),
        periodStart: ({ periodStart }) => new Date(periodStart.getTime() * 1000),
    } as IObjectTypeResolver<InvoiceObject, Context>,
};
