import { IObjectTypeResolver } from "@graphql-tools/utils";
import { omit } from "@utils/object-helper";
import { gql } from "apollo-server-core";
import { PrismaSelect } from "graphql-map-selections";
import { isEmpty } from "lodash";
import { Context } from "../../context";
import { TransactionStatus } from "./TransactionStatus";

type PaymentMethodInfo = {
    brand: string;
    last4: string;
    country: string;
    expYear: number;
    expMonth: number;
};

export type TransactionObject = {
    id: string;
    amount: number;
    currency: string;
    status: TransactionStatus;
    paymentMethodInfo?: PaymentMethodInfo;
    webhookReceivedLog?: any;
    responseReceivedLog?: any;
};

export type TransactionSelect = {
    id: boolean;
    amount: boolean;
    currency: boolean;
    status: boolean;
    webhookReceivedLog: boolean;
    responseReceivedLog: boolean;
};

export const toTrasactionSelect = (selections, defaultValue: any = false): PrismaSelect<TransactionSelect> => {
    if (!selections || isEmpty(selections)) return defaultValue;
    const transactionSelect = omit(selections, "paymentMethodInfo");

    if (!transactionSelect) return defaultValue;

    return {
        select: {
            ...transactionSelect,
            webhookReceivedLog: true,
            responseReceivedLog: true,
        } as TransactionSelect,
    };
};

const transactionResolver: IObjectTypeResolver<TransactionObject, Context> = {
    paymentMethodInfo: async ({ webhookReceivedLog, responseReceivedLog }) => {
        if (!webhookReceivedLog || !responseReceivedLog) return;
        const data = webhookReceivedLog.charges?.data || responseReceivedLog.charges?.data;
        if (!data) return;
        if (!(data instanceof Array)) return;
        if (data.length <= 0) return;
        const cardDetails = data[0].payment_method_details?.card;
        if (!cardDetails) return;
        return { ...cardDetails, expMonth: cardDetails.exp_month, expYear: cardDetails.exp_year };
    },
};

export const transactionObjectTypeDefs = gql`
    type PaymentMethodInfo {
        brand: String
        last4: String
        country: String
        expYear: Int
        expMonth: Int
    }

    type TransactionObject {
        id: ID
        amount: Float
        currency: String
        status: TransactionStatus
        paymentMethodInfo: PaymentMethodInfo
    }
`;

export const transactionObjectResolvers = {
    TransactionObject: transactionResolver,
};
