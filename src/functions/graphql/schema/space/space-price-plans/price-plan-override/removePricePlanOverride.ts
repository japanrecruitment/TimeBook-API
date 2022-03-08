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
        throw new GqlError({ code: "NOT_FOUND", message: "Price plan override not found" });

    if (accountId !== pricePlanOverride.pricePlan.space.accountId)
        throw new GqlError({ code: "FORBIDDEN", message: "You are not allowed to modify this space" });

    await store.pricePlanOverride.update({ where: { id }, data: { isDeleted: true } });

    return {
        message: `Successfully removed a override from your price plan named ${pricePlanOverride.pricePlan.title}`,
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
