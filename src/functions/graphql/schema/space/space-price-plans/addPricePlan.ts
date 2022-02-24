import { SpacePricePlanType } from "@prisma/client";
import { gql } from "apollo-server-core";
import { SpacePricePlanObject } from "./SpacePricePlanObject";
import { Result } from "../../core/result";
import { IFieldResolver } from "@graphql-tools/utils";
import { Context } from "src/functions/graphql/context";
import { GqlError } from "src/functions/graphql/error";
import { toSpacePricePlanSelect } from ".";
import { mapSelections } from "graphql-map-selections";
import { merge } from "lodash";
import { Log } from "@utils/logger";

type AddPricePlanInput = {
    amount: number;
    duration: number;
    title: string;
    type: SpacePricePlanType;
    fromDate: Date;
    toDate: Date;
    cooldownTime?: number;
    lastMinuteDiscount?: number;
    maintenanceFee?: number;
};

type AddPricePlanArgs = { spaceId: string; pricePlan: AddPricePlanInput };

type AddPricePlanResult = {
    result: Result;
    pricePlan: SpacePricePlanObject;
};

type AddPricePlan = IFieldResolver<any, Context, AddPricePlanArgs, Promise<AddPricePlanResult>>;

const validateInput = (input: AddPricePlanInput) => {
    const { amount, duration, title, type, cooldownTime, fromDate, lastMinuteDiscount, maintenanceFee, toDate } = input;

    if (!amount || amount <= 0) throw new GqlError({ code: "BAD_USER_INPUT", message: "Invalid amount" });

    if (!duration || duration <= 0) throw new GqlError({ code: "BAD_USER_INPUT", message: "Invalid duration" });

    if (!title || title.trim() === "") throw new GqlError({ code: "BAD_USER_INPUT", message: "Invalid title" });

    if (!Object.values(SpacePricePlanType).includes(type))
        throw new GqlError({ code: "BAD_USER_INPUT", message: "Invalid space type" });

    if (cooldownTime && cooldownTime < 0)
        throw new GqlError({ code: "BAD_USER_INPUT", message: "Invalid cooldown time" });

    if (fromDate && (fromDate.getTime() < Date.now() || (toDate && fromDate.getTime() > toDate.getTime())))
        throw new GqlError({ code: "BAD_USER_INPUT", message: "Invalid start date" });

    if (lastMinuteDiscount && lastMinuteDiscount < 0)
        throw new GqlError({ code: "BAD_USER_INPUT", message: "Invalid last minute discount" });

    if (maintenanceFee && maintenanceFee < 0)
        throw new GqlError({ code: "BAD_USER_INPUT", message: "Invalid maintenance fee" });

    if (toDate && (toDate.getTime() < Date.now() || (fromDate && toDate.getTime() < fromDate.getTime())))
        throw new GqlError({ code: "BAD_USER_INPUT", message: "Invalid end date" });
};

const addPricePlan: AddPricePlan = async (_, { pricePlan, spaceId }, { store, authData, dataSources }, info) => {
    validateInput(pricePlan);

    const isDefault = !pricePlan.fromDate && !pricePlan.toDate;

    const fromDate = !isDefault ? pricePlan.fromDate || new Date() : undefined;

    const toDate = !isDefault ? pricePlan.toDate : undefined;

    const { accountId } = authData;

    const space = await store.space.findFirst({
        where: { id: spaceId, isDeleted: false },
        select: {
            accountId: true,
            pricePlans: {
                where: isDefault
                    ? { isDefault, isDeleted: false }
                    : !toDate
                    ? {
                          AND: [
                              { isDefault, isDeleted: false, fromDate: { lte: fromDate } },
                              { OR: [{ toDate: null }, { toDate: { gte: fromDate } }] },
                          ],
                      }
                    : {
                          AND: [
                              { isDefault, isDeleted: false },
                              {
                                  OR: [
                                      { AND: [{ fromDate: { lte: fromDate } }, { toDate: { gte: toDate } }] },
                                      { AND: [{ fromDate: { gte: fromDate } }, { fromDate: { lte: toDate } }] },
                                      { AND: [{ toDate: { gte: fromDate } }, { toDate: { lte: toDate } }] },
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

    space.pricePlans?.forEach(({ type, duration }) => {
        if (pricePlan.type === type && pricePlan.duration === duration) {
            throw new GqlError({
                code: "BAD_USER_INPUT",
                message: `This space already has a price plan of type ${type} and duration ${duration}`,
            });
        }
    });

    const { select } = toSpacePricePlanSelect(mapSelections(info).pricePlan) || {};
    const newPricePlan = await store.spacePricePlan.create({
        data: { ...pricePlan, isDefault, fromDate, toDate, space: { connect: { id: spaceId } } },
        select: {
            ...select,
            space: {
                select: {
                    published: true,
                    pricePlans: { where: { isDefault: true, isDeleted: false }, orderBy: { createdAt: "desc" } },
                },
            },
        },
    });

    Log(`addSpacePricePlan: `, newPricePlan);

    const updatedSpace = newPricePlan.space;
    if (updatedSpace && updatedSpace.published) {
        await dataSources.spaceAlgolia.partialUpdateObject({
            objectID: spaceId,
            price: updatedSpace.pricePlans.map(({ amount, duration, type }) => ({ amount, duration, type })),
        });
    }

    return {
        result: { message: `Successfully added a new price plans in your space` },
        pricePlan: newPricePlan,
    };
};

export const addPricePlanTypeDefs = gql`
    input AddPricePlanInput {
        amount: Float!
        duration: Float!
        title: String!
        type: SpacePricePlanType!
        cooldownTime: Int
        fromDate: Date
        lastMinuteDiscount: Float
        maintenanceFee: Float
        toDate: Date
    }

    type AddPricePlanResult {
        result: Result
        pricePlan: SpacePricePlanObject
    }

    type Mutation {
        addPricePlan(spaceId: ID!, pricePlan: AddPricePlanInput!): AddPricePlanResult @auth(requires: [user, host])
    }
`;

export const addPricePlanResolvers = {
    Mutation: { addPricePlan },
};
