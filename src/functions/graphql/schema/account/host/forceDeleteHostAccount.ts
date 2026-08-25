import { IFieldResolver } from "@graphql-tools/utils";
import { gql } from "apollo-server-core";
import { GqlError } from "../../../error";
import { Context } from "../../../context";
import { Result } from "../../core/result";
import { addEmailToQueue } from "@utils/index";
import { AccountDeactivated } from "@utils/email-helper/templates/account-deactivated";

type ForceDeleteHostAccountArgs = { accountId: string; reason?: string };

type ForceDeleteHostAccountResult = Promise<Result>;

type ForceDeleteHostAccount = IFieldResolver<any, Context, ForceDeleteHostAccountArgs, ForceDeleteHostAccountResult>;

const forceDeleteHostAccount: ForceDeleteHostAccount = async (_, { accountId, reason }, { store }) => {
    const account = await store.account.findUnique({
        where: { id: accountId },
        select: { email: true, roles: true, deactivated: true, host: { select: { id: true } } },
    });

    if (!account) throw new GqlError({ code: "NOT_FOUND", message: "アカウントが見つかりませんでした。" });

    if (!account.roles.includes("host") || !account.host)
        throw new GqlError({ code: "BAD_REQUEST", message: "ホストアカウントではありません。" });

    if (account.deactivated) throw new GqlError({ code: "BAD_REQUEST", message: "アカウントはすでに削除されています。" });

    await store.account.update({
        where: { id: accountId },
        data: {
            deactivated: true,
            deactivationReason: reason || "管理者によるアカウント強制削除",
            suspended: true,
            host: { update: { suspended: true } },
        },
    });

    await addEmailToQueue<AccountDeactivated>({
        template: "account-deactivated",
        recipientEmail: account.email,
        recipientName: "",
    });

    return { message: `ホストアカウントが強制的に削除されました。` };
};

export const forceDeleteHostAccountTypeDefs = gql`
    type Mutation {
        forceDeleteHostAccount(accountId: ID!, reason: String): Result @auth(requires: [admin])
    }
`;

export const forceDeleteHostAccountResolvers = { Mutation: { forceDeleteHostAccount } };
