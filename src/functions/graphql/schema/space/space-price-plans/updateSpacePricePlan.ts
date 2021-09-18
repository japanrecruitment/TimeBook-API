import { SpacePricePlanType } from ".prisma/client";
import { IFieldResolver } from "@graphql-tools/utils";
import { gql } from "apollo-server-express";
import { Context } from "../../../context";
import { GqlError } from "src/functions/graphql/error";
import { Result } from "../../core/result";

type UpdateSpacePricePlanInput = {
    id: string;
    spaceId: string;
    amount?: number;
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
    const { id, spaceId, amount, cooldownTime, lastMinuteDiscount, maintenanceFee, title, type } = input;

    const spacePricePlan = await store.spacePricePlan.findFirst({
        where: { id, spaceId },
        include: { space: { select: { accountId: true } } },
    });

    if (!spacePricePlan) throw new GqlError({ code: "NOT_FOUND", message: "Space price not found" });

    if (accountId !== spacePricePlan.space.accountId)
        throw new GqlError({ code: "FORBIDDEN", message: "You are not allowed to modify this space" });

    if (amount && amount < 0) throw new GqlError({ code: "BAD_USER_INPUT", message: "Invalid amount" });

    if (cooldownTime && cooldownTime < 0)
        throw new GqlError({ code: "BAD_USER_INPUT", message: "Invalid cooldown time" });

    if (lastMinuteDiscount && lastMinuteDiscount < 0)
        throw new GqlError({ code: "BAD_USER_INPUT", message: "Invalid last minute discount" });

    if (maintenanceFee && maintenanceFee < 0)
        throw new GqlError({ code: "BAD_USER_INPUT", message: "Invalid maintenance fee" });

    if (title && !title.trim()) throw new GqlError({ code: "BAD_USER_INPUT", message: "Invalid title" });

    if (!Object.values(SpacePricePlanType).includes(type))
        throw new GqlError({ code: "BAD_USER_INPUT", message: "Invalid space type" });

    const isIdentical =
        amount === spacePricePlan.amount &&
        cooldownTime === spacePricePlan.cooldownTime &&
        lastMinuteDiscount === spacePricePlan.lastMinuteDiscount &&
        maintenanceFee === spacePricePlan.maintenanceFee &&
        title === spacePricePlan.title &&
        type === spacePricePlan.type;

    if (isIdentical) return { message: `No changes found in submited space price plan` };

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
        select: { id: true, spacePricePlans: { select: { amount: true, type: true } } },
    });

    await dataSources.spaceAlgolia.partialUpdateObject({
        objectID: updatedSpace.id,
        price: updatedSpace.spacePricePlans?.map(({ amount, type }) => ({ amount, type })),
    });

    return { message: `Successfully updated ${title} plan in your space` };
};

export const updateSpacePricePlanTypeDefs = gql`
    input UpdateSpacePricePlanInput {
        id: ID!
        spaceId: ID!
        amount: Float
        title: String
        type: SpacePricePlanType
        cooldownTime: Int
        lastMinuteDiscount: Float
        maintenanceFee: Float
    }

    type Mutation {
        updateSpacePricePlan(input: UpdateSpacePricePlanInput!) Result! @auth(requires: [user, host])
    }
`;

export const updateSpacePricePlanResolvers = {
    Mutation: { updateSpacePricePlan },
};
