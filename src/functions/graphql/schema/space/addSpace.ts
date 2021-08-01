import { IFieldResolver } from "@graphql-tools/utils";
import { gql } from "apollo-server-core";
import { Context } from "../../context";
import { GqlError } from "../../error";
import { Result } from "../core/result";
import { NearestStationsInput } from "./nearestStation";
import { AddSpacePricePlanInput } from "./spacePricePlan";

type AddSpaceInput = {
    name: string;
    maximumCapacity: number;
    numberOfSeats: number;
    spaceSize: number;
    spacePricePlan: AddSpacePricePlanInput;
    nearestStations: NearestStationsInput[];
    spaceTypes: string[];
};

type AddSpace = IFieldResolver<any, Context, Record<"input", AddSpaceInput>, Promise<Result>>;

const addSpace: AddSpace = async (_, { input }, { authData, store }) => {
    const { accountId } = authData;
    const { name, maximumCapacity, numberOfSeats, spaceSize, spacePricePlan, nearestStations, spaceTypes } = input;
    const { planTitle, hourlyPrice, dailyPrice, maintenanceFee, lastMinuteDiscount, cooldownTime } = spacePricePlan;
    const isValid =
        name.trim() &&
        planTitle.trim() &&
        maximumCapacity != 0 &&
        numberOfSeats != 0 &&
        spaceSize != 0 &&
        hourlyPrice != 0 &&
        dailyPrice != 0 &&
        maintenanceFee != 0 &&
        cooldownTime != 0;
    if (!isValid) throw new GqlError({ code: "BAD_USER_INPUT", message: "Provide all neccessary fields" });
    await store.space.create({
        data: {
            name,
            maximumCapacity,
            numberOfSeats,
            spaceSize,
            account: { connect: { id: accountId } },
            spacePricePlans: {
                create: { planTitle, hourlyPrice, dailyPrice, maintenanceFee, lastMinuteDiscount, cooldownTime },
            },
            nearestStations: { createMany: { data: nearestStations } },
            spaceTypes: { createMany: { data: spaceTypes.map((spaceTypeId) => ({ spaceTypeId })) } },
        },
    });

    return { message: `Successfully added space` };
};

export const addSpaceTypeDefs = gql`
    input AddSpaceInput {
        name: String!
        maximumCapacity: Int!
        numberOfSeats: Int!
        spaceSize: Float
        spacePricePlan: AddSpacePricePlanInput!
        nearestStations: [NearestStationsInput]!
        spaceTypes: [ID]!
    }

    type Mutation {
        addSpace(input: AddSpaceInput!): Result! @auth(requires: [user, host])
    }
`;

export const addSpaceResolvers = { Mutation: { addSpace } };
