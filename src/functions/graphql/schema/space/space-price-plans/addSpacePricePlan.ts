import { SpacePricePlanType } from "@prisma/client";
import { IFieldResolver } from "@graphql-tools/utils";
import { gql } from "apollo-server-core";
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
    fromDate: Date;
    toDate: Date;
    cooldownTime?: number;
    lastMinuteDiscount?: number;
    maintenanceFee?: number;
};

type AddSpacePricePlanArgs = { spaceId: string; pricePlan: AddSpacePricePlanInput };

type AddSpacePricePlanResult = {
    result: Result;
    pricePlan: SpacePricePlanObject;
};

type AddSpacePricePlan = IFieldResolver<any, Context, AddSpacePricePlanArgs, Promise<AddSpacePricePlanResult>>;

const addSpacePricePlan: AddSpacePricePlan = async (_, { spaceId, pricePlan }, { authData, store }, info) => {
    const { accountId } = authData;

    const space = await store.space.findFirst({
        where: { id: spaceId, isDeleted: false },
        select: { accountId: true },
    });

    if (!space) throw new GqlError({ code: "NOT_FOUND", message: "Space not found" });

    if (accountId !== space.accountId)
        throw new GqlError({ code: "FORBIDDEN", message: "You are not allowed to modify this space" });

    let { amount, duration, title, type, cooldownTime, lastMinuteDiscount, maintenanceFee, fromDate, toDate } =
        pricePlan;

    if (!amount || amount < 0) throw new GqlError({ code: "BAD_USER_INPUT", message: "Invalid amount" });

    if (!duration || duration < 0) throw new GqlError({ code: "BAD_USER_INPUT", message: "Invalid duration" });

    if (cooldownTime && cooldownTime < 0)
        throw new GqlError({ code: "BAD_USER_INPUT", message: "Invalid cooldown time" });

    if (lastMinuteDiscount && lastMinuteDiscount < 0)
        throw new GqlError({ code: "BAD_USER_INPUT", message: "Invalid last minute discount" });

    if (maintenanceFee && maintenanceFee < 0)
        throw new GqlError({ code: "BAD_USER_INPUT", message: "Invalid maintenance fee" });

    if (!title || title?.trim() === "") throw new GqlError({ code: "BAD_USER_INPUT", message: "Invalid title" });

    if (!Object.values(SpacePricePlanType).includes(type))
        throw new GqlError({ code: "BAD_USER_INPUT", message: "Invalid space type" });

    if (fromDate.getTime() < Date.now() || fromDate.getTime() < toDate.getTime())
        throw new GqlError({ code: "BAD_USER_INPUT", message: "Invalid start date" });

    if (toDate.getTime() < Date.now() || toDate.getTime() > fromDate.getTime())
        throw new GqlError({ code: "BAD_USER_INPUT", message: "Invalid end date" });

    const select = toSpacePricePlanSelect(mapSelections(info).pricePlans);
    const newPricePlan = await store.spacePricePlan.create({
        data: { ...pricePlan, title: title.trim(), space: { connect: { id: spaceId } } },
        ...select,
    });

    return {
        pricePlan: newPricePlan,
        result: { message: `Successfully added new price plan with title ${title} in your space` },
    };
};

export const addSpacePricePlanTypeDefs = gql`
    input AddSpacePricePlanInput {
        amount: Float!
        duration: Float!
        title: String!
        fromDate: Date!
        toDate: Date!
        type: SpacePricePlanType!
        cooldownTime: Int
        lastMinuteDiscount: Float
        maintenanceFee: Float
    }

    type AddSpacePricePlanResult {
        result: Result
        pricePlan: SpacePricePlanObject
    }

    type Mutation {
        addSpacePricePlan(spaceId: ID!, pricePlan: AddSpacePricePlanInpu!): AddSpacePricePlanResult!
            @auth(requires: [user, host])
    }
`;

export const addSpacePricePlanResolvers = {
    Mutation: { addSpacePricePlan },
};
