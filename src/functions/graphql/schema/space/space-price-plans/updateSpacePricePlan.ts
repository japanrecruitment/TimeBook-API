import { SpacePricePlanType } from "@prisma/client";
import { IFieldResolver } from "@graphql-tools/utils";
import { gql } from "apollo-server-core";
import { Context } from "../../../context";
import { GqlError } from "src/functions/graphql/error";
import { Result } from "../../core/result";

type UpdateSpacePricePlanInput = {
    id: string;
    spaceId: string;
    amount?: number;
    duration?: number;
    title?: string;
    type?: SpacePricePlanType;
    cooldownTime?: number;
    lastMinuteDiscount?: number;
    maintenanceFee?: number;
};

type UpdateSpacePricePlanArgs = { input: UpdateSpacePricePlanInput };

type UpdateSpacePricePlanResult = Promise<Result>;

type UpdateSpacePricePlan = IFieldResolver<any, Context, UpdateSpacePricePlanArgs, UpdateSpacePricePlanResult>;

const updateSpacePricePlan: UpdateSpacePricePlan = async (_, { input }, { authData, dataSources, store }) => {
    const { accountId } = authData;
    const { id, spaceId, amount, duration, cooldownTime, lastMinuteDiscount, maintenanceFee, title, type } = input;

    if (!amount && !duration && !cooldownTime && !lastMinuteDiscount && !maintenanceFee && !title && !type)
        throw new GqlError({ code: "BAD_REQUEST", message: "All fields in submited price plan are empty" });

    const spacePricePlan = await store.spacePricePlan.findFirst({
        where: { id, spaceId },
        select: { amount: true, duration: true, type: true, space: { select: { accountId: true, isDeleted: true } } },
    });

    if (!spacePricePlan || spacePricePlan.space.isDeleted)
        throw new GqlError({ code: "NOT_FOUND", message: "Space price not found" });

    if (accountId !== spacePricePlan.space.accountId)
        throw new GqlError({ code: "FORBIDDEN", message: "You are not allowed to modify this space" });

    if (amount && amount < 0) throw new GqlError({ code: "BAD_USER_INPUT", message: "Invalid amount" });

    if (duration && duration < 0) throw new GqlError({ code: "BAD_USER_INPUT", message: "Invalid duration" });

    if (cooldownTime && cooldownTime < 0)
        throw new GqlError({ code: "BAD_USER_INPUT", message: "Invalid cooldown time" });

    if (lastMinuteDiscount && lastMinuteDiscount < 0)
        throw new GqlError({ code: "BAD_USER_INPUT", message: "Invalid last minute discount" });

    if (maintenanceFee && maintenanceFee < 0)
        throw new GqlError({ code: "BAD_USER_INPUT", message: "Invalid maintenance fee" });

    if (title?.trim() === "") throw new GqlError({ code: "BAD_USER_INPUT", message: "Invalid title" });

    if (type && !Object.values(SpacePricePlanType).includes(type))
        throw new GqlError({ code: "BAD_USER_INPUT", message: "Invalid space type" });

    const updatedSpace = await store.space.update({
        where: { id: spaceId },
        data: {
            spacePricePlans: {
                update: {
                    where: { id },
                    data: { title, type, amount, cooldownTime, lastMinuteDiscount, maintenanceFee },
                },
            },
        },
        select: { id: true, spacePricePlans: { select: { amount: true, duration: true, type: true } } },
    });

    await dataSources.spaceAlgolia.partialUpdateObject({
        objectID: updatedSpace.id,
        price: updatedSpace.spacePricePlans?.map(({ amount, duration, type }) => ({ amount, duration, type })),
    });

    return { message: `Successfully updated price plan named ${title} in your space` };
};

export const updateSpacePricePlanTypeDefs = gql`
    input UpdateSpacePricePlanInput {
        id: ID!
        spaceId: ID!
        amount: Float
        duration: Float
        title: String
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
