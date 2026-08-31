import { IFieldResolver } from "@graphql-tools/utils";
import { gql } from "apollo-server-core";
import { GqlError } from "../../error";
import { Context } from "../../context";
import { Result } from "../core/result";
import { addEmailToQueue } from "@utils/index";
import { AccountDeactivated } from "@utils/email-helper/templates/account-deactivated";

type ForceDeleteAccountArgs = { accountId: string; reason?: string };

type ForceDeleteAccountResult = Promise<Result>;

type ForceDeleteAccount = IFieldResolver<any, Context, ForceDeleteAccountArgs, ForceDeleteAccountResult>;

const forceDeleteAccount: ForceDeleteAccount = async (_, { accountId, reason }, { store }) => {
    const account = await store.account.findUnique({
        where: { id: accountId },
        select: { email: true, roles: true, deactivated: true, host: { select: { id: true } } },
    });

    if (!account) throw new GqlError({ code: "NOT_FOUND", message: "アカウントが見つかりませんでした。" });

    if (account.deactivated) throw new GqlError({ code: "BAD_REQUEST", message: "アカウントはすでに削除されています。" });

    const isHost = account.roles.includes("host") && !!account.host;

    await store.account.update({
        where: { id: accountId },
        data: {
            deactivated: true,
            deactivationReason: reason || "管理者によるアカウント強制削除",
            suspended: true,
            ...(isHost && { host: { update: { suspended: true } } }),
        },
    });

    await addEmailToQueue<AccountDeactivated>({
        template: "account-deactivated",
        recipientEmail: account.email,
        recipientName: "",
    });

    return { message: `アカウントが強制的に削除されました。` };
};

export const forceDeleteAccountTypeDefs = gql`
    type Mutation {
        forceDeleteAccount(accountId: ID!, reason: String): Result @auth(requires: [admin])
    }
`;

export const forceDeleteAccountResolvers = { Mutation: { forceDeleteAccount } };
