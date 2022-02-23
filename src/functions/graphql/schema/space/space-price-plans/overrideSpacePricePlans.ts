import { SpacePricePlanType } from "@prisma/client";
import { IFieldResolver } from "@graphql-tools/utils";
import { gql } from "apollo-server-core";
import { GqlError } from "src/functions/graphql/error";
import { Context } from "../../../context";
import { Result } from "../../core/result";
import { SpacePricePlanObject, toSpacePricePlanSelect } from "./SpacePricePlanObject";
import { mapSelections } from "graphql-map-selections";
import { merge } from "lodash";

type OverrideSpacePricePlansInput = {
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

type OverrideSpacePricePlansArgs = { spaceId: string; pricePlans: OverrideSpacePricePlansInput[] };

type OverrideSpacePricePlansResult = {
    result: Result;
    pricePlans: SpacePricePlanObject[];
};

type OverrideSpacePricePlans = IFieldResolver<
    any,
    Context,
    OverrideSpacePricePlansArgs,
    Promise<OverrideSpacePricePlansResult>
>;

const overrideSpacePricePlans: OverrideSpacePricePlans = async (
    _,
    { spaceId, pricePlans },
    { authData, store },
    info
) => {
    const { accountId } = authData;

    const space = await store.space.findFirst({
        where: { id: spaceId, isDeleted: false },
        select: { accountId: true },
    });

    if (!space) throw new GqlError({ code: "NOT_FOUND", message: "Space not found" });

    if (accountId !== space.accountId)
        throw new GqlError({ code: "FORBIDDEN", message: "You are not allowed to modify this space" });

    const pricePlansToAdd = pricePlans.map(
        ({ amount, duration, type, title, cooldownTime, lastMinuteDiscount, maintenanceFee, fromDate, toDate }) => {
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

            if (fromDate.getTime() < Date.now() || fromDate.getTime() > toDate.getTime())
                throw new GqlError({ code: "BAD_USER_INPUT", message: "Invalid start date" });

            if (toDate.getTime() < Date.now() || toDate.getTime() < fromDate.getTime())
                throw new GqlError({ code: "BAD_USER_INPUT", message: "Invalid end date" });

            return {
                amount,
                duration,
                type,
                title: title.trim(),
                cooldownTime,
                lastMinuteDiscount,
                maintenanceFee,
                fromDate,
                toDate,
            };
        }
    );

    const currDate = new Date();
    const select = toSpacePricePlanSelect(mapSelections(info).pricePlans);
    const updatedSpace = await store.space.update({
        where: { id: spaceId },
        data: { pricePlans: { createMany: { data: pricePlansToAdd, skipDuplicates: true } } },
        select: {
            published: true,
            pricePlans: {
                where: { isDefault: false, isDeleted: false, createdAt: { gte: currDate } },
                orderBy: { createdAt: "desc" },
                ...merge(select, {
                    select: { amount: true, duration: true, type: true, isDefault: true, createdAt: true },
                }),
            },
        },
    });

    return {
        pricePlans: updatedSpace.pricePlans,
        result: { message: `Successfully added ${pricePlans.length} new price plans in your space` },
    };
};

export const overrideSpacePricePlansTypeDefs = gql`
    input OverrideSpacePricePlansInput {
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

    type OverrideSpacePricePlansResult {
        result: Result
        pricePlans: [SpacePricePlanObject]
    }

    type Mutation {
        overrideSpacePricePlans(
            spaceId: ID!
            pricePlans: [OverrideSpacePricePlansInput!]!
        ): OverrideSpacePricePlansResult! @auth(requires: [user, host])
    }
`;

export const overrideSpacePricePlansResolvers = {
    Mutation: { overrideSpacePricePlans },
};
