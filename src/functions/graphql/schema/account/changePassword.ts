import { IFieldResolver } from "@graphql-tools/utils";
import { encodePassword, matchPassword } from "@utils/authUtils";
import { gql } from "apollo-server-core";
import { Context } from "../../context";
import { GqlError } from "../../error";
import { Result } from "../core/result";
import { addEmailToQueue, PasswordChangeEmailData } from "@utils/email-helper";

type ChangePasswordInput = {
    currentPassword: string;
    newPassword: string;
};

type ChangePassword = IFieldResolver<any, Context, Record<"input", ChangePasswordInput>, Promise<Result>>;

const changePassword: ChangePassword = async (_, { input }, { store, authData }) => {
    const { currentPassword, newPassword } = input;
    const { accountId } = authData;

    const account = await store.account.findUnique({
        where: { id: accountId },
        select: { password: true, email: true },
    });

    // check if account exists
    if (!account) throw new GqlError({ code: "NOT_FOUND", message: "ユーザーが見つかりません。" });

    // Check if password match
    const passwordMatched = matchPassword(currentPassword, account.password);
    if (!passwordMatched) throw new GqlError({ code: "FORBIDDEN", message: "パスワードが間違っています。" });

    const accountUpdate = await store.account.update({
        where: { id: accountId },
        data: { password: encodePassword(newPassword) },
    });
    if (!accountUpdate)
        throw new GqlError({ code: "INTERNAL_SERVER_ERROR", message: "パスワードを更新できませんでした。" });

    await addEmailToQueue<PasswordChangeEmailData>({
        template: "password-changed",
        recipientEmail: account.email,
        recipientName: "",
    });

    return {
        message: `パスワードが変更されました。`,
        action: null,
    };
};

export const changePasswordTypeDefs = gql`
    input ChangePasswordInput {
        currentPassword: String!
        newPassword: String!
    }

    type Mutation {
        changePassword(input: ChangePasswordInput!): Result! @auth(requires: [user, host])
    }
`;

export const changePasswordResolvers = {
    Mutation: { changePassword },
};
