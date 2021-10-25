import { SpacePricePlanType } from "@prisma/client";
import { IFieldResolver } from "@graphql-tools/utils";
import { gql } from "apollo-server-core";
import { merge } from "lodash";
import { GqlError } from "src/functions/graphql/error";
import { Context } from "../../../context";
import { Result } from "../../core/result";
import { SpacePricePlanObject, toSpacePricePlanSelect } from "./SpacePricePlanObject";
import { mapSelections } from "graphql-map-selections";

type AddSpacePricePlanInput = {
    amount: number;
    duration: number;
    title: string;
    type: SpacePricePlanType;
    cooldownTime?: number;
    lastMinuteDiscount?: number;
    maintenanceFee?: number;
};

type AddSpacePricePlansArgs = { spaceId: string; pricePlans: AddSpacePricePlanInput[] };

type AddSpacePricePlansResult = {
    result: Result;
    spacePricePlans: SpacePricePlanObject[];
};

type AddSpacePricePlans = IFieldResolver<any, Context, AddSpacePricePlansArgs, Promise<AddSpacePricePlansResult>>;

const addSpacePricePlans: AddSpacePricePlans = async (
    _,
    { spaceId, pricePlans },
    { authData, dataSources, store },
    info
) => {
    const { accountId } = authData;

    const space = await store.space.findFirst({
        where: { id: spaceId, isDeleted: false },
        select: { accountId: true, spacePricePlans: { select: { id: true } } },
    });

    if (!space) throw new GqlError({ code: "NOT_FOUND", message: "Space not found" });

    if (accountId !== space.accountId)
        throw new GqlError({ code: "FORBIDDEN", message: "You are not allowed to modify this space" });

    const pricePlansToAdd = pricePlans.map(
        ({ amount, duration, title, type, cooldownTime, lastMinuteDiscount, maintenanceFee }) => {
            if (!amount || amount < 0) throw new GqlError({ code: "BAD_USER_INPUT", message: "Invalid amount" });

            if (!duration || duration < 0) throw new GqlError({ code: "BAD_USER_INPUT", message: "Invalid duration" });

            if (cooldownTime && cooldownTime < 0)
                throw new GqlError({ code: "BAD_USER_INPUT", message: "Invalid cooldown time" });

            if (lastMinuteDiscount && lastMinuteDiscount < 0)
                throw new GqlError({ code: "BAD_USER_INPUT", message: "Invalid last minute discount" });

            if (maintenanceFee && maintenanceFee < 0)
                throw new GqlError({ code: "BAD_USER_INPUT", message: "Invalid maintenance fee" });

            if (!title || title?.trim() === "")
                throw new GqlError({ code: "BAD_USER_INPUT", message: "Invalid title" });

            if (!Object.values(SpacePricePlanType).includes(type))
                throw new GqlError({ code: "BAD_USER_INPUT", message: "Invalid space type" });

            return { amount, duration, cooldownTime, lastMinuteDiscount, maintenanceFee, title: title.trim(), type };
        }
    );

    const updatedSpace = await store.space.update({
        where: { id: spaceId },
        data: { spacePricePlans: { createMany: { data: pricePlansToAdd } } },
        select: {
            id: true,
            spacePricePlans: merge(toSpacePricePlanSelect(mapSelections(info).spacePricePlans), {
                select: { amount: true, duration: true, type: true },
            }),
        },
    });

    await dataSources.spaceAlgolia.partialUpdateObject({
        objectID: updatedSpace.id,
        price: updatedSpace.spacePricePlans.map(({ amount, duration, type }) => ({ amount, duration, type })),
    });

    return {
        spacePricePlans: updatedSpace.spacePricePlans,
        result: { message: `Successfully ${pricePlansToAdd.length} added price plan in your space` },
    };
};

export const addSpacePricePlansTypeDefs = gql`
    input AddSpacePricePlanInput {
        amount: Float!
        duration: Float!
        title: String!
        type: SpacePricePlanType!
        cooldownTime: Int
        lastMinuteDiscount: Float
        maintenanceFee: Float
    }

    type AddSpacePricePlansResult {
        result: Result
        spacePricePlans: [SpacePricePlanObject]
    }

    type Mutation {
        addSpacePricePlans(spaceId: ID!, pricePlans: [AddSpacePricePlanInput]!): AddSpacePricePlansResult!
            @auth(requires: [user, host])
    }
`;

export const addSpacePricePlansResolvers = {
    Mutation: { addSpacePricePlans },
};
