import { SpacePricePlanType, SpacePricePlan } from "@prisma/client";
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

type AddDefaultPriceInput = {
    dailyAmount: number;
    hourlyAmount: number;
    fiveMinuteAmount: number;
    tenMinuteAmount: number;
    fifteenMinuteAmount: number;
    thirtyMinuteAmount: number;
    fortyFiveMinuteAmount: number;
};

type AddDefaultPriceArgs = { spaceId: string; input: AddDefaultPriceInput };

type AddDefaultPriceResult = {
    result: Result;
    pricePlans: SpacePricePlanObject[];
};

type AddDefaultPrice = IFieldResolver<any, Context, AddDefaultPriceArgs, Promise<AddDefaultPriceResult>>;

const validateInput = (input: AddDefaultPriceInput) => {
    const {
        dailyAmount,
        fifteenMinuteAmount,
        fiveMinuteAmount,
        fortyFiveMinuteAmount,
        hourlyAmount,
        tenMinuteAmount,
        thirtyMinuteAmount,
    } = input;

    if (
        !dailyAmount &&
        dailyAmount <= 0 &&
        !fifteenMinuteAmount &&
        fifteenMinuteAmount <= 0 &&
        !fiveMinuteAmount &&
        fiveMinuteAmount <= 0 &&
        !fortyFiveMinuteAmount &&
        fortyFiveMinuteAmount <= 0 &&
        !hourlyAmount &&
        hourlyAmount <= 0 &&
        !tenMinuteAmount &&
        tenMinuteAmount <= 0 &&
        !thirtyMinuteAmount &&
        thirtyMinuteAmount <= 0
    ) {
        throw new GqlError({ code: "BAD_REQUEST", message: "Add atleast one price plan" });
    }
};

const addDefaultPrice: AddDefaultPrice = async (_, { input, spaceId }, { authData, dataSources, store }, info) => {
    validateInput(input);

    const { accountId } = authData;

    const space = await store.space.findFirst({
        where: { id: spaceId, isDeleted: false },
        select: {
            accountId: true,
            pricePlans: {
                where: {
                    AND: [
                        { isDefault: true, isDeleted: false },
                        {
                            OR: [
                                { type: "DAILY", duration: 1 },
                                { type: "HOURLY", duration: 1 },
                                { type: "MINUTES", duration: 5 },
                                { type: "MINUTES", duration: 10 },
                                { type: "MINUTES", duration: 15 },
                                { type: "MINUTES", duration: 30 },
                                { type: "MINUTES", duration: 45 },
                            ],
                        },
                    ],
                },
            },
        },
    });

    if (!space) throw new GqlError({ code: "NOT_FOUND", message: "Space not found" });

    if (accountId !== space.accountId)
        throw new GqlError({ code: "FORBIDDEN", message: "You are not allowed to modify this space" });

    const pricePlansToAdd: Array<Pick<SpacePricePlan, "amount" | "duration" | "title" | "type" | "isDefault">> = [];
    if (input.dailyAmount)
        pricePlansToAdd.push({
            amount: input.dailyAmount,
            duration: 1,
            title: "default 1 day",
            type: "DAILY",
            isDefault: true,
        });
    if (input.hourlyAmount)
        pricePlansToAdd.push({
            amount: input.hourlyAmount,
            duration: 1,
            title: "default 1 hour",
            type: "HOURLY",
            isDefault: true,
        });
    if (input.fiveMinuteAmount)
        pricePlansToAdd.push({
            amount: input.fiveMinuteAmount,
            duration: 5,
            title: "default 5 minutes",
            type: "MINUTES",
            isDefault: true,
        });
    if (input.tenMinuteAmount)
        pricePlansToAdd.push({
            amount: input.tenMinuteAmount,
            duration: 10,
            title: "default 10 minutes",
            type: "MINUTES",
            isDefault: true,
        });
    if (input.fifteenMinuteAmount)
        pricePlansToAdd.push({
            amount: input.fifteenMinuteAmount,
            duration: 15,
            title: "default 15 minutes",
            type: "MINUTES",
            isDefault: true,
        });
    if (input.thirtyMinuteAmount)
        pricePlansToAdd.push({
            amount: input.thirtyMinuteAmount,
            duration: 30,
            title: "default 30 minutes",
            type: "MINUTES",
            isDefault: true,
        });
    if (input.fortyFiveMinuteAmount)
        pricePlansToAdd.push({
            amount: input.fortyFiveMinuteAmount,
            duration: 45,
            title: "default 45 minutes",
            type: "MINUTES",
            isDefault: true,
        });

    pricePlansToAdd.forEach(({ type, duration }) => {
        if (space.pricePlans.some((p) => p.type === type && p.duration === duration)) {
            throw new GqlError({
                code: "BAD_USER_INPUT",
                message: `This space already has default price plan of type ${type} and duration ${duration}`,
            });
        }
    });

    const currDate = Date.now();
    const { select } = toSpacePricePlanSelect(mapSelections(info).pricePlans) || {};
    const updatedSpace = await store.space.update({
        where: { id: spaceId },
        data: { pricePlans: { createMany: { data: pricePlansToAdd, skipDuplicates: true } } },
        select: {
            published: true,
            pricePlans: {
                where: { isDefault: true, isDeleted: false },
                orderBy: { createdAt: "desc" },
                select: {
                    ...select,
                    amount: true,
                    duration: true,
                    type: true,
                    isDefault: true,
                    createdAt: true,
                },
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
        result: { message: `Successfully added ${newPricePlans.length} new default price plans in your space` },
        pricePlans: newPricePlans,
    };
};

export const addDefaultPriceTypeDefs = gql`
    input AddDefaultPriceInput {
        dailyAmount: Float
        hourlyAmount: Float
        fiveMinuteAmount: Float
        tenMinuteAmount: Float
        fifteenMinuteAmount: Float
        thirtyMinuteAmount: Float
        fortyFiveMinuteAmount: Float
    }

    type AddDefaultPriceResult {
        result: Result
        pricePlans: [SpacePricePlanObject]
    }

    type Mutation {
        addDefaultPrice(spaceId: ID!, input: AddDefaultPriceInput!): AddDefaultPriceResult!
            @auth(requires: [user, host])
    }
`;

export const addDefaultPriceResolvers = {
    Mutation: { addDefaultPrice },
};
