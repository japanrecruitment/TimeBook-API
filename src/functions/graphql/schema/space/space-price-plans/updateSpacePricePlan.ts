import { SpacePricePlanType } from "@prisma/client";
import { IFieldResolver } from "@graphql-tools/utils";
import { gql } from "apollo-server-core";
import { Context } from "../../../context";
import { GqlError } from "src/functions/graphql/error";
import { Result } from "../../core/result";
import { omit } from "@utils/object-helper";

type UpdateSpacePricePlanInput = {
    id: string;
    amount?: number;
    duration?: number;
    title?: string;
    type?: SpacePricePlanType;
    fromDate?: Date;
    toDate?: Date;
    cooldownTime?: number;
    lastMinuteDiscount?: number;
    maintenanceFee?: number;
};

type UpdateSpacePricePlanArgs = { input: UpdateSpacePricePlanInput };

type UpdateSpacePricePlanResult = Promise<Result>;

type UpdateSpacePricePlan = IFieldResolver<any, Context, UpdateSpacePricePlanArgs, UpdateSpacePricePlanResult>;

const updateSpacePricePlan: UpdateSpacePricePlan = async (_, { input }, { authData, dataSources, store }) => {
    const { accountId } = authData;
    const { id, amount, duration, cooldownTime, lastMinuteDiscount, maintenanceFee, title, type, fromDate, toDate } =
        input;

    if (!amount && !duration && !cooldownTime && !lastMinuteDiscount && !maintenanceFee && !title && !type)
        throw new GqlError({ code: "BAD_REQUEST", message: "無効なリクエスト" });

    const spacePricePlan = await store.spacePricePlan.findUnique({
        where: { id },
        select: { isDefault: true, isDeleted: true, space: { select: { id: true, accountId: true, isDeleted: true } } },
    });

    if (!spacePricePlan || spacePricePlan.isDeleted || spacePricePlan.space.isDeleted)
        throw new GqlError({ code: "NOT_FOUND", message: "料金プランが見つかりませんでした" });

    if (accountId !== spacePricePlan.space.accountId)
        throw new GqlError({ code: "FORBIDDEN", message: "無効なリクエスト" });

    if (amount && amount <= 0) throw new GqlError({ code: "BAD_USER_INPUT", message: "無効な料金" });

    if (duration && duration <= 0) throw new GqlError({ code: "BAD_USER_INPUT", message: "無効な期間" });

    if (cooldownTime && cooldownTime < 0) throw new GqlError({ code: "BAD_USER_INPUT", message: "無効なリセット時間" });

    if (lastMinuteDiscount && lastMinuteDiscount < 0)
        throw new GqlError({ code: "BAD_USER_INPUT", message: "無効な直前割引" });

    if (maintenanceFee && maintenanceFee < 0) throw new GqlError({ code: "BAD_USER_INPUT", message: "無効な手数料" });

    if (title?.trim() === "") throw new GqlError({ code: "BAD_USER_INPUT", message: "無効なタイトル" });

    if (type && !Object.values(SpacePricePlanType).includes(type))
        throw new GqlError({ code: "BAD_USER_INPUT", message: "無効なスペースタイプ" });

    if (!spacePricePlan.isDefault) {
        if (fromDate && (fromDate.getTime() < Date.now() || (toDate && fromDate.getTime() < toDate.getTime())))
            throw new GqlError({ code: "BAD_USER_INPUT", message: "無効な開始日" });

        if (toDate && (toDate.getTime() < Date.now() || (fromDate && toDate.getTime() > fromDate.getTime())))
            throw new GqlError({ code: "BAD_USER_INPUT", message: "無効な終了日" });
    }

    let inputData = spacePricePlan.isDefault ? omit(input, "id", "fromDate", "toDate") : omit(input, "id");
    inputData = { ...inputData, title: title ? title.trim() : undefined };
    const updatedSpace = await store.space.update({
        where: { id: spacePricePlan.space.id },
        data: { pricePlans: { update: { where: { id }, data: inputData } } },
        select: {
            id: true,
            published: true,
            pricePlans: {
                where: { isDefault: true, isDeleted: false },
                orderBy: { createdAt: "desc" },
                select: { amount: true, duration: true, type: true },
            },
        },
    });

    if (updatedSpace.published) {
        await dataSources.spaceAlgolia.partialUpdateObject({
            objectID: updatedSpace.id,
            price: updatedSpace.pricePlans?.map(({ amount, duration, type }) => ({ amount, duration, type })),
        });
    }

    return { message: `スペース設定が更新されました` };
};

export const updateSpacePricePlanTypeDefs = gql`
    input UpdateSpacePricePlanInput {
        id: ID!
        amount: Float
        duration: Float
        title: String
        fromDate: Date
        toDate: Date
        type: SpacePricePlanType
        cooldownTime: Int
        lastMinuteDiscount: Float
        maintenanceFee: Float
    }

    type Mutation {
        updateSpacePricePlan(input: UpdateSpacePricePlanInput!): Result! @auth(requires: [user, host])
    }
`;

export const updateSpacePricePlanResolvers = {
    Mutation: { updateSpacePricePlan },
};
