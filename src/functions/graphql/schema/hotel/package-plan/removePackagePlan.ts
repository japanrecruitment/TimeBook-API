import { IFieldResolver } from "@graphql-tools/utils";
import { gql } from "apollo-server-core";
import { Context } from "../../../context";
import { GqlError } from "../../../error";
import { Result } from "../../core/result";

type RemovePackagePlanArgs = { id: string };

type RemovePackagePlanResult = Result;

type RemovePackagePlan = IFieldResolver<any, Context, RemovePackagePlanArgs, Promise<RemovePackagePlanResult>>;

const removePackagePlan: RemovePackagePlan = async (_, { id }, { authData, store }) => {
    const { accountId } = authData || {};
    if (!accountId) throw new GqlError({ code: "FORBIDDEN", message: "無効なリクエスト" });

    const packagePlan = await store.packagePlan.findFirst({
        where: { id, hotel: { accountId } },
        select: { name: true },
    });
    if (!packagePlan) throw new GqlError({ code: "NOT_FOUND", message: "プランが見つかりません。" });

    // Block deletion while active reservations exist for this plan
    const activeReservations = await store.hotelRoomReservation.count({
        where: { packagePlanId: id, status: { in: ["RESERVED", "HOLD", "PENDING"] } },
    });
    if (activeReservations > 0)
        throw new GqlError({
            code: "BAD_REQUEST",
            message: `「${packagePlan.name}」プランには有効な予約が${activeReservations}件あるため、削除できません。予約の完了またはキャンセル後に再度お試しください。`,
        });

    // Cascade deletes (room type links, price settings, photos, etc.) are handled by the schema
    await store.packagePlan.delete({ where: { id } });

    return { message: `「${packagePlan.name}」プランが削除されました` };
};

export const removePackagePlanTypeDefs = gql`
    type Mutation {
        removePackagePlan(id: ID!): Result! @auth(requires: [host])
    }
`;

export const removePackagePlanResolvers = { Mutation: { removePackagePlan } };
