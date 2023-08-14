import { IFieldResolver } from "@graphql-tools/utils";
import { gql } from "apollo-server-core";
import { GqlError } from "../../../error";
import { Context } from "../../../context";
import { Result } from "../../core/result";

type SuspendAccountArgs = { accountId: string };

type SuspendAccountResult = Promise<Result>;

type SuspendAccount = IFieldResolver<any, Context, SuspendAccountArgs, SuspendAccountResult>;

const suspendAccount: SuspendAccount = async (_, { accountId }, { store }) => {
    const account = await store.account.findUnique({ where: { id: accountId }, select: { suspended: true } });

    if (!account) throw new GqlError({ code: "NOT_FOUND", message: "アカウントが見つかりません" });

    if (account.suspended) throw new GqlError({ code: "BAD_REQUEST", message: "アカウントはすでに停止されています" });

    await store.account.update({ where: { id: accountId }, data: { suspended: true } });

    return { message: `アカウントが一時停止されました` };
};

export const suspendAccountTypeDefs = gql`
    type Mutation {
        suspendAccount(accountId: ID!): Result @auth(requires: [admin])
    }
`;

export const suspendAccountResolvers = { Mutation: { suspendAccount } };
