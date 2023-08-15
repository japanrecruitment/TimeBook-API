import { IFieldResolver } from "@graphql-tools/utils";
import { matchPassword } from "@utils/authUtils";
import { gql } from "apollo-server-core";
import { Context } from "../../context";
import { GqlError } from "../../error";
import { Result } from "../core/result";
import { Log } from "@utils/logger";
import { ReservationStatus } from "@prisma/client";
import { addEmailToQueue } from "@utils/index";
import { AccountDeactivated } from "@utils/email-helper/templates/account-deactivated";

type DeactivateAccountInput = {
    password: string;
    reason: string;
};

type DeactivateAccount = IFieldResolver<any, Context, Record<"input", DeactivateAccountInput>, Promise<Result>>;

const deactivateAccount: DeactivateAccount = async (_, { input }, { store, authData }) => {
    const { password, reason } = input;
    const { accountId } = authData;

    // validate user input
    if (!password || !reason || password.length < 6 || reason.trim().length === 0)
        throw new GqlError({ code: "NOT_FOUND", message: "無効なリクエスト" });

    const account = await store.account.findUnique({
        where: { id: accountId },
        select: { email: true, password: true, roles: true },
    });

    // check if account exists
    if (!account) throw new GqlError({ code: "NOT_FOUND", message: "ユーザーが見つかりません" });

    // Check if password match
    const passwordMatched = matchPassword(password, account.password);
    if (!passwordMatched) throw new GqlError({ code: "FORBIDDEN", message: "パスワードが一致しません" });

    // check if host (return error if host)
    if (account.roles.includes("host"))
        throw new GqlError({ code: "FORBIDDEN", message: "ホストアカウントは退会できません" });

    // if not host check if any pending reservations
    const spaceReservations = await store.reservation.findMany({
        where: {
            AND: [
                { reserveeId: accountId },
                { fromDateTime: { gte: new Date() } },
                {
                    OR: [
                        { status: ReservationStatus.HOLD },
                        { status: ReservationStatus.PENDING },
                        { status: ReservationStatus.RESERVED },
                    ],
                },
            ],
        },
        select: { id: true, status: true, fromDateTime: true },
    });

    const hotelReservations = await store.hotelRoomReservation.findMany({
        where: {
            AND: [
                { reserveeId: accountId },
                { fromDateTime: { gte: new Date() } },
                {
                    OR: [
                        { status: ReservationStatus.HOLD },
                        { status: ReservationStatus.PENDING },
                        { status: ReservationStatus.RESERVED },
                    ],
                },
            ],
        },
        select: { id: true, status: true, fromDateTime: true },
    });

    // check if reservations exists
    if (spaceReservations.length > 0 || hotelReservations.length > 0) {
        throw new GqlError({
            code: "FORBIDDEN",
            message:
                "今後の保留中または確認済みの予約があるため、現在アカウントを削除できません。 後でもう一度試してください。",
        });
    }

    const accountUpdate = await store.account.update({
        where: { id: accountId },
        data: { deactivated: true, deactivationReason: reason },
    });

    if (!accountUpdate)
        throw new GqlError({ code: "INTERNAL_SERVER_ERROR", message: "リクエストの処理に失敗しました。" });

    // Send email to user
    // account.email
    await addEmailToQueue<AccountDeactivated>({
        template: "account-deactivated",
        recipientEmail: account.email,
        recipientName: "",
    });

    return {
        message: `アカウントは削除されました。`,
        action: null,
    };
};

export const deactivateAccountTypeDefs = gql`
    input DeactivateAccountInput {
        password: String!
        reason: String!
    }

    type Mutation {
        deactivateAccount(input: DeactivateAccountInput!): Result! @auth(requires: [user])
    }
`;

export const deactivateAccountResolvers = {
    Mutation: { deactivateAccount: deactivateAccount },
};
