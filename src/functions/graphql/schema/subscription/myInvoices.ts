import { IFieldResolver } from "@graphql-tools/utils";
import { StripeLib } from "@libs/paymentProvider";
import { gql } from "apollo-server-core";
import { Context } from "../../context";
import { GqlError } from "../../error";
import {
    createPaginationResult,
    createPaginationResultType,
    PaginationOption,
    PaginationResult,
} from "../core/pagination";
import { InvoiceObject, mapStripeInvoiceToInvoiceObject } from "./InvoiceObject";

type MyInvoicesArgs = { paginate: PaginationOption };

type MyInvoicesResult = Promise<PaginationResult<Partial<InvoiceObject>>>;

type MyInvoices = IFieldResolver<any, Context, MyInvoicesArgs, MyInvoicesResult>;

const myInvoices: MyInvoices = async (_, { paginate }, { authData, store }) => {
    const { accountId, id: userId } = authData;
    if (!accountId || !userId) throw new GqlError({ code: "FORBIDDEN", message: "無効なリクエスト" });

    const { after, skip, take } = paginate || {};

    const user = await store.user.findUnique({ where: { id: userId }, select: { stripeCustomerId: true } });
    if (!user) throw new GqlError({ code: "BAD_REQUEST", message: "ユーザーが見つかりません" });
    if (!user.stripeCustomerId)
        throw new GqlError({ code: "BAD_REQUEST", message: "ストライプアカウントが見つかりません" });

    const stripe = new StripeLib();
    const stripeInvoices = await stripe.listInvoices(user.stripeCustomerId, after as string, take);
    const invoices = stripeInvoices.map(mapStripeInvoiceToInvoiceObject);

    return createPaginationResult(invoices, take, undefined, after);
};

export const myInvoicesTypeDefs = gql`
    ${createPaginationResultType("MyInvoicesResult", "InvoiceObject")}
    type Query {
        myInvoices(paginate: PaginationOption): MyInvoicesResult @auth(requires: [user, host])
    }
`;

export const myInvoicesResolvers = { Query: { myInvoices } };
