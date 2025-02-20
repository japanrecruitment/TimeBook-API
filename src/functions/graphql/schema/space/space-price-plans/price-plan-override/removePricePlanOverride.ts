import { IFieldResolver } from "@graphql-tools/utils";
import { gql } from "apollo-server-core";
import { Context } from "../../../../context";
import { GqlError } from "src/functions/graphql/error";
import { Result } from "../../../core/result";

type RemovePricePlanOverrideArgs = { id: string };

type RemovePricePlanOverrideResult = Promise<Result>;

type RemovePricePlanOverride = IFieldResolver<any, Context, RemovePricePlanOverrideArgs, RemovePricePlanOverrideResult>;

const removePricePlanOverride: RemovePricePlanOverride = async (_, { id }, { authData, dataSources, store }) => {
    const { accountId } = authData;

    const pricePlanOverride = await store.pricePlanOverride.findFirst({
        where: { id },
        select: {
            isDeleted: true,
            pricePlan: {
                select: { title: true, space: { select: { accountId: true } } },
            },
        },
    });

    if (!pricePlanOverride || pricePlanOverride.isDeleted)
        throw new GqlError({ code: "NOT_FOUND", message: "料金プランの上書きが見つかりません" });

    if (accountId !== pricePlanOverride.pricePlan.space.accountId)
        throw new GqlError({ code: "FORBIDDEN", message: "この料金プランは変更できません" });

    await store.pricePlanOverride.update({ where: { id }, data: { isDeleted: true } });

    return {
        message: `料金プラン「${pricePlanOverride.pricePlan.title}」の上書きを削除しました`,
    };
};

export const removePricePlanOverrideTypeDefs = gql`
    type Mutation {
        removePricePlanOverride(id: ID!): Result! @auth(requires: [user, host])
    }
`;

export const removePricePlanOverrideResolvers = {
    Mutation: { removePricePlanOverride },
};
