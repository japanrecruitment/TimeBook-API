import { SpacePricePlanType } from ".prisma/client";
import { IFieldResolver } from "@graphql-tools/utils";
import { gql } from "apollo-server-express";
import { Context } from "../../../context";
import { GqlError } from "src/functions/graphql/error";
import { Result } from "../../core/result";

type RemoveSpacePricePlanInput = {
    id: string;
    spaceId: string;
};

type RemoveSpacePricePlanArgs = { input: RemoveSpacePricePlanInput };

type RemoveSpacePricePlanResult = Promise<Result>;

type RemoveSpacePricePlan = IFieldResolver<any, Context, RemoveSpacePricePlanArgs, RemoveSpacePricePlanResult>;

const removeSpacePricePlan: RemoveSpacePricePlan = async (_, { input }, { authData, dataSources, store }) => {
    const { accountId } = authData;
    const { id, spaceId } = input;

    const spacePricePlan = await store.spacePricePlan.findFirst({
        where: { id, spaceId },
        select: { title: true, space: { select: { accountId: true } } },
    });

    if (!spacePricePlan) throw new GqlError({ code: "NOT_FOUND", message: "Space price plan not found" });

    if (accountId !== spacePricePlan.space.accountId)
        throw new GqlError({ code: "FORBIDDEN", message: "You are not allowed to modify this space" });

    const updatedSpace = await store.space.update({
        where: { id: spaceId },
        data: { spacePricePlans: { delete: { id } } },
        select: { id: true, spacePricePlans: { select: { amount: true, duration: true, type: true } } },
    });

    await dataSources.spaceAlgolia.partialUpdateObject({
        objectID: updatedSpace.id,
        price: updatedSpace.spacePricePlans?.map(({ amount, duration, type }) => ({ amount, duration, type })),
    });

    return { message: `Successfully removed price plan named ${spacePricePlan.title} from your space` };
};

export const removeSpacePricePlanTypeDefs = gql`
    input RemoveSpacePricePlanInput {
        id: ID!
        spaceId: ID!
    }

    type Mutation {
        removeSpacePricePlan(input: RemoveSpacePricePlanInput!): Result! @auth(requires: [user, host])
    }
`;

export const removeSpacePricePlanResolvers = {
    Mutation: { removeSpacePricePlan },
};
