import { IFieldResolver } from "@graphql-tools/utils";
import { gql } from "apollo-server-core";
import { Context } from "../../context";
import { GqlError } from "../../error";
import {
    createPaginationResult,
    createPaginationResultType,
    PaginationOption,
    PaginationResult,
} from "../core/pagination";
import { InvoiceObject } from "./InvoiceObject";

type MyInvoicesArgs = { paginate: PaginationOption };

type MyInvoicesResult = Promise<PaginationResult<Partial<InvoiceObject>>>;

type MyInvoices = IFieldResolver<any, Context, MyInvoicesArgs, MyInvoicesResult>;

const myInvoices: MyInvoices = async (_, { paginate }, { authData, store }) => {
    const { accountId, id: userId } = authData;
    if (!accountId || !userId) throw new GqlError({ code: "FORBIDDEN", message: "Invalid token!!" });

    const { after, skip, take } = paginate || {};

    const user = await store.user.findUnique({ where: { id: userId }, select: { stripeCustomerId: true } });
    if (!user) throw new GqlError({ code: "BAD_REQUEST", message: "User not found" });
    if (!user.stripeCustomerId) throw new GqlError({ code: "BAD_REQUEST", message: "Stripe account not found" });

    return createPaginationResult([]);
};

export const myInvoicesTypeDefs = gql`
    ${createPaginationResultType("MyInvoicesResult", "InvoiceObject")}
    type Query {
        myInvoices(paginate: PaginationOption): MyInvoicesResult @auth(requires: [user, host])
    }
`;

export const myInvoicesResolvers = { Query: { myInvoices } };
