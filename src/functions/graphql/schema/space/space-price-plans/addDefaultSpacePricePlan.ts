import { SpacePricePlanType } from "@prisma/client";
import { gql } from "apollo-server-core";
import { SpacePricePlanObject } from "./SpacePricePlanObject";
import { Context } from "../../../context";
import { GqlError } from "../../../error";
import { Result } from "../../core/result";
import { IFieldResolver } from "@graphql-tools/utils";
import { toSpacePricePlanSelect } from ".";
import { mapSelections } from "graphql-map-selections";
import { Log } from "@utils/logger";
import { merge } from "lodash";

type AddDefaultSpacePricePlansInput = {
    amount: number;
    duration: number;
    type: SpacePricePlanType;
    cooldownTime?: number;
    lastMinuteDiscount?: number;
    maintenanceFee?: number;
};

type AddDefaultSpacePricePlansArgs = { spaceId: string; pricePlans: AddDefaultSpacePricePlansInput[] };

type AddDefaultSpacePricePlansResult = {
    result: Result;
    pricePlans: SpacePricePlanObject[];
};

type AddDefaultSpacePricePlans = IFieldResolver<
    any,
    Context,
    AddDefaultSpacePricePlansArgs,
    Promise<AddDefaultSpacePricePlansResult>
>;

const addDefaultSpacePricePlans: AddDefaultSpacePricePlans = async (
    _,
    { pricePlans, spaceId },
    { authData, dataSources, store },
    info
) => {
    const { accountId } = authData;

    const space = await store.space.findFirst({
        where: { id: spaceId, isDeleted: false },
        select: {
            accountId: true,
            pricePlans: {
                where: { isDefault: true, isDeleted: false },
                orderBy: { createdAt: "desc" },
                select: { id: true, type: true, duration: true },
            },
        },
    });

    if (!space) throw new GqlError({ code: "NOT_FOUND", message: "Space not found" });

    if (accountId !== space.accountId)
        throw new GqlError({ code: "FORBIDDEN", message: "You are not allowed to modify this space" });

    const pricePlansToAdd = pricePlans.map(
        ({ amount, duration, type, cooldownTime, lastMinuteDiscount, maintenanceFee }) => {
            if (!amount || amount < 0) throw new GqlError({ code: "BAD_USER_INPUT", message: "Invalid amount" });

            if (!duration || duration <= 0) throw new GqlError({ code: "BAD_USER_INPUT", message: "Invalid duration" });

            if (cooldownTime && cooldownTime < 0)
                throw new GqlError({ code: "BAD_USER_INPUT", message: "Invalid cooldown time" });

            if (lastMinuteDiscount && lastMinuteDiscount < 0)
                throw new GqlError({ code: "BAD_USER_INPUT", message: "Invalid last minute discount" });

            if (maintenanceFee && maintenanceFee < 0)
                throw new GqlError({ code: "BAD_USER_INPUT", message: "Invalid maintenance fee" });

            if (space.pricePlans.some((p) => p.type === type && p.duration === duration))
                throw new GqlError({
                    code: "BAD_USER_INPUT",
                    message: `This space already has default price plan of type ${type} and duration ${duration}`,
                });

            if (pricePlans.filter((p) => p.type === type && p.duration === duration).length > 1)
                throw new GqlError({
                    code: "BAD_USER_INPUT",
                    message: `Multiple price plans detected with same type ${type} and duration ${duration}`,
                });

            return {
                amount,
                duration,
                type,
                title: "Default",
                isDefault: true,
                cooldownTime,
                lastMinuteDiscount,
                maintenanceFee,
            };
        }
    );

    const currDate = Date.now();
    const select = toSpacePricePlanSelect(mapSelections(info).pricePlans);
    const updatedSpace = await store.space.update({
        where: { id: spaceId },
        data: { pricePlans: { createMany: { data: pricePlansToAdd, skipDuplicates: true } } },
        select: {
            published: true,
            pricePlans: {
                where: { isDefault: true, isDeleted: false },
                orderBy: { createdAt: "desc" },
                ...merge(select, {
                    select: { amount: true, duration: true, type: true, isDefault: true, createdAt: true },
                }),
            },
        },
    });

    Log(`addDefaultSpacePricePlan: `, updatedSpace);

    if (updatedSpace.published) {
        await dataSources.spaceAlgolia.partialUpdateObject({
            objectID: spaceId,
            price: updatedSpace.pricePlans.map(({ amount, duration, type }) => ({ amount, duration, type })),
        });
    }

    const newPricePlans = updatedSpace.pricePlans.filter(({ createdAt }) => createdAt.getTime() >= currDate);
    return {
        result: { message: `Successfully added ${pricePlans.length} new default price plans in your space` },
        pricePlans: newPricePlans,
    };
};

export const addDefaultSpacePricePlansTypeDefs = gql`
    input AddDefaultSpacePricePlanInput {
        amount: Float!
        duration: Float!
        type: SpacePricePlanType!
        cooldownTime: Int
        lastMinuteDiscount: Float
        maintenanceFee: Float
    }

    type AddDefaultSpacePricePlansResult {
        result: Result
        pricePlans: [SpacePricePlanObject]
    }

    type Mutation {
        addDefaultSpacePricePlans(
            spaceId: ID!
            pricePlans: [AddDefaultSpacePricePlanInput!]!
        ): AddDefaultSpacePricePlansResult! @auth(requires: [user, host])
    }
`;

export const addDefaultSpacePricePlansResolvers = {
    Mutation: { addDefaultSpacePricePlans },
};
