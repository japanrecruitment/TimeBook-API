import { TransactionStatus as ITransactionStatus } from "@prisma/client";
import { gql } from "apollo-server-core";

export type TransactionStatus = ITransactionStatus;

export const transactionStatusTypeDef = gql`
    enum TransactionStatus {
        CREATED
        REQUESTED
        REQUEST_SUCCESSFULL
        WEBHOOK_RECEIVED
        SUCCESSFULL
        FAILED
    }
`;

export const transactionStatusResolver = { TransactionStatus: ITransactionStatus };
