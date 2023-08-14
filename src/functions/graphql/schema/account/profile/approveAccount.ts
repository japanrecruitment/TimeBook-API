import { IFieldResolver } from "@graphql-tools/utils";
import { gql } from "apollo-server-core";
import { GqlError } from "../../../error";
import { Context } from "../../../context";
import { Result } from "../../core/result";

type ApproveAccountArgs = { accountId: string };

type ApproveAccountResult = Promise<Result>;

type ApproveAccount = IFieldResolver<any, Context, ApproveAccountArgs, ApproveAccountResult>;

const approveAccount: ApproveAccount = async (_, { accountId }, { store }) => {
    const account = await store.account.findUnique({ where: { id: accountId }, select: { approved: true } });

    if (!account) throw new GqlError({ code: "NOT_FOUND", message: "アカウントが見つかりませんでした。" });

    if (account.approved) throw new GqlError({ code: "BAD_REQUEST", message: "アカウントはすでに承認されています。" });

    await store.account.update({
        where: { id: accountId },
        data: { approved: true, host: { update: { approved: true } } },
    });

    return { message: `アカウントが承認されました。` };
};

export const approveAccountTypeDefs = gql`
    type Mutation {
        approveAccount(accountId: ID!): Result @auth(requires: [admin])
    }
`;

export const approveAccountResolvers = { Mutation: { approveAccount } };
