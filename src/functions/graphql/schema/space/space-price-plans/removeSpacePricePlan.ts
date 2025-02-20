import { IFieldResolver } from "@graphql-tools/utils";
import { gql } from "apollo-server-core";
import { Context } from "../../../context";
import { GqlError } from "src/functions/graphql/error";
import { Result } from "../../core/result";

type RemoveSpacePricePlanArgs = { id: string };

type RemoveSpacePricePlanResult = Promise<Result>;

type RemoveSpacePricePlan = IFieldResolver<any, Context, RemoveSpacePricePlanArgs, RemoveSpacePricePlanResult>;

const removeSpacePricePlan: RemoveSpacePricePlan = async (_, { id }, { authData, dataSources, store }) => {
    const { accountId } = authData;

    const spacePricePlan = await store.spacePricePlan.findFirst({
        where: { id },
        select: {
            isDefault: true,
            isDeleted: true,
            title: true,
            space: { select: { id: true, accountId: true, isDeleted: true } },
        },
    });

    if (!spacePricePlan || spacePricePlan.isDeleted || spacePricePlan.space.isDeleted)
        throw new GqlError({ code: "NOT_FOUND", message: "料金プランが見つかりません" });

    if (accountId !== spacePricePlan.space.accountId)
        throw new GqlError({ code: "FORBIDDEN", message: "無効なリクエスト" });

    const updatedSpace = await store.space.update({
        where: { id: spacePricePlan.space.id },
        data: { pricePlans: { update: { where: { id }, data: { isDeleted: true } } } },
        select: {
            id: true,
            published: true,
            pricePlans: spacePricePlan.isDefault
                ? {
                      where: { isDefault: true, isDeleted: false },
                      orderBy: { createdAt: "desc" },
                      select: { amount: true, duration: true, type: true },
                  }
                : false,
        },
    });

    if (spacePricePlan.isDefault && updatedSpace.published) {
        await dataSources.spaceAlgolia.partialUpdateObject({
            objectID: updatedSpace.id,
            price: updatedSpace.pricePlans?.map(({ amount, duration, type }) => ({ amount, duration, type })),
        });
    }

    return { message: `「${spacePricePlan.title}」料金プランが削除されました` };
};

export const removeSpacePricePlanTypeDefs = gql`
    type Mutation {
        removeSpacePricePlan(id: ID!): Result! @auth(requires: [user, host])
    }
`;

export const removeSpacePricePlanResolvers = {
    Mutation: { removeSpacePricePlan },
};
