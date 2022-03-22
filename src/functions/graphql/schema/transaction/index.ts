import { mergeResolvers, mergeTypeDefs } from "@graphql-tools/merge";
import { transactionObjectResolvers, transactionObjectTypeDefs } from "./TransactionObject";
import { transactionStatusResolver, transactionStatusTypeDef } from "./TransactionStatus";

export const typeDefs = mergeTypeDefs([transactionObjectTypeDefs, transactionStatusTypeDef]);

export const resolvers = mergeResolvers([transactionObjectResolvers, transactionStatusResolver]);
