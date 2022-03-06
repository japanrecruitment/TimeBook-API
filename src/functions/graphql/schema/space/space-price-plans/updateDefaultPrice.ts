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

type UpdateDefaultPriceInput = {
    dailyAmount: number;
    hourlyAmount: number;
    fiveMinuteAmount: number;
    tenMinuteAmount: number;
    fifteenMinuteAmount: number;
    thirtyMinuteAmount: number;
    fortyFiveMinuteAmount: number;
};

type UpdateDefaultPriceArgs = { spaceId: string; input: UpdateDefaultPriceInput };

type UpdateDefaultPriceResult = {
    result: Result;
    pricePlans: SpacePricePlanObject[];
};

type UpdateDefaultPrice = IFieldResolver<any, Context, UpdateDefaultPriceArgs, Promise<UpdateDefaultPriceResult>>;

const validateInput = (input: UpdateDefaultPriceInput) => {
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
        !fifteenMinuteAmount &&
        !fiveMinuteAmount &&
        !fortyFiveMinuteAmount &&
        !hourlyAmount &&
        !tenMinuteAmount &&
        !thirtyMinuteAmount
    ) {
        throw new GqlError({ code: "BAD_REQUEST", message: "Add atleast one price plan" });
    }
};

const updateDefaultPrice: UpdateDefaultPrice = async (
    _,
    { input, spaceId },
    { authData, dataSources, store },
    info
) => {
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
    const pricePlansToUpdate: Array<Pick<SpacePricePlan, "id" | "amount" | "isDeleted">> = [];
    if (input.dailyAmount) {
        const plan = space.pricePlans.find((p) => p.type === "DAILY" && p.duration === 1);
        if (plan) {
            pricePlansToUpdate.push({ id: plan.id, amount: input.dailyAmount, isDeleted: input.dailyAmount <= 0 });
        } else {
            pricePlansToAdd.push({
                amount: input.dailyAmount,
                duration: 1,
                title: "default 1 day",
                type: "DAILY",
                isDefault: true,
            });
        }
    }
    if (input.hourlyAmount) {
        const plan = space.pricePlans.find((p) => p.type === "HOURLY" && p.duration === 1);
        if (plan) {
            pricePlansToUpdate.push({ id: plan.id, amount: input.hourlyAmount, isDeleted: input.hourlyAmount <= 0 });
        } else {
            pricePlansToAdd.push({
                amount: input.hourlyAmount,
                duration: 1,
                title: "default 1 hour",
                type: "HOURLY",
                isDefault: true,
            });
        }
    }
    if (input.fiveMinuteAmount) {
        const plan = space.pricePlans.find((p) => p.type === "MINUTES" && p.duration === 5);
        if (plan) {
            pricePlansToUpdate.push({
                id: plan.id,
                amount: input.fiveMinuteAmount,
                isDeleted: input.fifteenMinuteAmount <= 0,
            });
        } else {
            pricePlansToAdd.push({
                amount: input.fiveMinuteAmount,
                duration: 5,
                title: "default 5 minutes",
                type: "MINUTES",
                isDefault: true,
            });
        }
    }
    if (input.tenMinuteAmount) {
        const plan = space.pricePlans.find((p) => p.type === "MINUTES" && p.duration === 10);
        if (plan) {
            pricePlansToUpdate.push({
                id: plan.id,
                amount: input.tenMinuteAmount,
                isDeleted: input.tenMinuteAmount <= 0,
            });
        } else {
            pricePlansToAdd.push({
                amount: input.tenMinuteAmount,
                duration: 10,
                title: "default 10 minutes",
                type: "MINUTES",
                isDefault: true,
            });
        }
    }
    if (input.fifteenMinuteAmount) {
        const plan = space.pricePlans.find((p) => p.type === "MINUTES" && p.duration === 15);
        if (plan) {
            pricePlansToUpdate.push({
                id: plan.id,
                amount: input.fifteenMinuteAmount,
                isDeleted: input.fifteenMinuteAmount <= 0,
            });
        } else {
            pricePlansToAdd.push({
                amount: input.fifteenMinuteAmount,
                duration: 15,
                title: "default 15 minutes",
                type: "MINUTES",
                isDefault: true,
            });
        }
    }
    if (input.thirtyMinuteAmount) {
        const plan = space.pricePlans.find((p) => p.type === "MINUTES" && p.duration === 30);
        if (plan) {
            pricePlansToUpdate.push({
                id: plan.id,
                amount: input.thirtyMinuteAmount,
                isDeleted: input.thirtyMinuteAmount <= 0,
            });
        } else {
            pricePlansToAdd.push({
                amount: input.thirtyMinuteAmount,
                duration: 30,
                title: "default 30 minutes",
                type: "MINUTES",
                isDefault: true,
            });
        }
    }
    if (input.fortyFiveMinuteAmount) {
        const plan = space.pricePlans.find((p) => p.type === "MINUTES" && p.duration === 45);
        if (plan) {
            pricePlansToUpdate.push({
                id: plan.id,
                amount: input.fortyFiveMinuteAmount,
                isDeleted: input.fortyFiveMinuteAmount <= 0,
            });
        } else {
            pricePlansToAdd.push({
                amount: input.fortyFiveMinuteAmount,
                duration: 45,
                title: "default 45 minutes",
                type: "MINUTES",
                isDefault: true,
            });
        }
    }

    let updatePlansCount = pricePlansToUpdate.length;
    pricePlansToUpdate.forEach(async ({ id, ...data }) => {
        await store.spacePricePlan.update({ where: { id }, data });
    });

    let addPlansCount = pricePlansToAdd.length;
    if (addPlansCount > 0) {
        const addedPlans = await store.spacePricePlan.createMany({
            data: pricePlansToAdd.map((p) => ({ ...p, spaceId })),
            skipDuplicates: true,
        });
        addPlansCount = addedPlans.count;
    }

    const { select } = toSpacePricePlanSelect(mapSelections(info).pricePlans) || {};
    const updatedSpace = await store.space.findUnique({
        where: { id: spaceId },
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
                    updatedAt: true,
                },
            },
        },
    });

    Log(`updateDefaultSpacePricePlan: `, updatedSpace);

    if (updatedSpace.published) {
        await dataSources.spaceAlgolia.partialUpdateObject({
            objectID: spaceId,
            price: updatedSpace.pricePlans.map(({ amount, duration, type }) => ({ amount, duration, type })),
        });
    }

    return {
        result: {
            message: `Successfully updated ${updatePlansCount} added ${addPlansCount} default price plans in your space`,
        },
        pricePlans: updatedSpace.pricePlans,
    };
};

export const updateDefaultPriceTypeDefs = gql`
    input UpdateDefaultPriceInput {
        dailyAmount: Float
        hourlyAmount: Float
        fiveMinuteAmount: Float
        tenMinuteAmount: Float
        fifteenMinuteAmount: Float
        thirtyMinuteAmount: Float
        fortyFiveMinuteAmount: Float
    }

    type UpdateDefaultPriceResult {
        result: Result
        pricePlans: [SpacePricePlanObject]
    }

    type Mutation {
        updateDefaultPrice(spaceId: ID!, input: UpdateDefaultPriceInput!): UpdateDefaultPriceResult!
            @auth(requires: [user, host])
    }
`;

export const updateDefaultPriceResolvers = {
    Mutation: { updateDefaultPrice },
};
