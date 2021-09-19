import { SpacePricePlanType } from ".prisma/client";
import { IFieldResolver } from "@graphql-tools/utils";
import { gql } from "apollo-server-express";
import { GqlError } from "src/functions/graphql/error";
import { Context } from "../../../context";
import { Result } from "../../core/result";

type AddSpacePricePlanInput = {
    amount: number;
    duration: number;
    spaceId: string;
    title: string;
    type: SpacePricePlanType;
    cooldownTime?: number;
    lastMinuteDiscount?: number;
    maintenanceFee?: number;
};

type AddSpacePricePlanArgs = { input: AddSpacePricePlanInput };

type AddSpacePricePlanResult = Promise<Result>;

type AddSpacePricePlan = IFieldResolver<any, Context, AddSpacePricePlanArgs, AddSpacePricePlanResult>;

const addSpacePricePlan: AddSpacePricePlan = async (_, { input }, { authData, dataSources, store }) => {
    const { accountId } = authData;
    const { amount, duration, cooldownTime, lastMinuteDiscount, maintenanceFee, spaceId, title, type } = input;

    const space = await store.space.findUnique({
        where: { id: spaceId },
        select: { accountId: true, spacePricePlans: { select: { id: true } } },
    });

    if (!space) throw new GqlError({ code: "NOT_FOUND", message: "Space not found" });

    if (accountId !== space.accountId)
        throw new GqlError({ code: "FORBIDDEN", message: "You are not allowed to modify this space" });

    if (!amount || amount < 0) throw new GqlError({ code: "BAD_USER_INPUT", message: "Invalid amount" });

    if (!duration || duration < 0) throw new GqlError({ code: "BAD_USER_INPUT", message: "Invalid duration" });

    if (cooldownTime && cooldownTime < 0)
        throw new GqlError({ code: "BAD_USER_INPUT", message: "Invalid cooldown time" });

    if (lastMinuteDiscount && lastMinuteDiscount < 0)
        throw new GqlError({ code: "BAD_USER_INPUT", message: "Invalid last minute discount" });

    if (maintenanceFee && maintenanceFee < 0)
        throw new GqlError({ code: "BAD_USER_INPUT", message: "Invalid maintenance fee" });

    if (!title || !title.trim()) throw new GqlError({ code: "BAD_USER_INPUT", message: "Invalid title" });

    if (!Object.values(SpacePricePlanType).includes(type))
        throw new GqlError({ code: "BAD_USER_INPUT", message: "Invalid space type" });

    const updatedSpace = await store.space.update({
        where: { id: spaceId },
        data: {
            spacePricePlans: {
                create: { title, type, duration, amount, cooldownTime, lastMinuteDiscount, maintenanceFee },
            },
        },
        select: { id: true, spacePricePlans: { select: { amount: true, duration: true, type: true } } },
    });

    await dataSources.spaceAlgolia.partialUpdateObject({
        objectID: updatedSpace.id,
        price: updatedSpace.spacePricePlans.map(({ amount, duration, type }) => ({ amount, duration, type })),
    });

    return { message: `Successfully added ${title} plan in your space` };
};

export const addSpacePricePlanTypeDefs = gql`
    input AddSpacePricePlanInput {
        amount: Float!
        duration: Float!
        spaceId: ID!
        title: String!
        type: SpacePricePlanType!
        cooldownTime: Int
        lastMinuteDiscount: Float
        maintenanceFee: Float
    }

    type Mutation {
        addSpacePricePlan(input: AddSpacePricePlanInput!): Result! @auth(requires: [user, host])
    }
`;

export const addSpacePricePlanResolvers = {
    Mutation: { addSpacePricePlan },
};
