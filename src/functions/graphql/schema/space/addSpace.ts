import { gql } from "apollo-server-core";
import { Context } from "../../context";
import { GqlError } from "../../error";
import { Result } from "../core/result";
import { IFieldResolver } from "@graphql-tools/utils";

type AddSpaceInput = {
    name: string;
    maximumCapacity: number;
    numberOfSeats: number;
    spaceSize: number;
    spacePricePlan: SpacePricePlan;
    nearestStations: NearestStation[];
    space_To_Space_Types: Space_to_Space_Types[];
};
type SpacePricePlan = {
    planTitle: string;
    hourlyPrice: number;
    dailyPrice: number;
    maintenanceFee: number;
    lastMinuteDiscount: number;
    cooldownTime: number;
};
type NearestStation = {
    stationId: number;
    via: string;
    time: number;
};
type Space_to_Space_Types = {
    spaceTypeId: string;
};
type AddSpace = IFieldResolver<any, Context, Record<"input", AddSpaceInput>, Promise<Result>>;
const addSpace: AddSpace = async (_, { input }, { store, dataSources }) => {
    const accountId = "accountidfromtoken"; //for test
    let { name, maximumCapacity, numberOfSeats, spaceSize, spacePricePlan, nearestStations, space_To_Space_Types } =
        input;
    let { planTitle, hourlyPrice, dailyPrice, maintenanceFee, lastMinuteDiscount, cooldownTime } = spacePricePlan;
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
            accountId,
            spacePricePlans: {
                create: {
                    planTitle,
                    hourlyPrice,
                    dailyPrice,
                    maintenanceFee,
                    lastMinuteDiscount,
                    cooldownTime,
                },
            },
            nearestStations: {
                createMany: {
                    data: nearestStations,
                },
            },
            spaceTypes: {
                createMany: {
                    data: space_To_Space_Types,
                },
            },
        },
    });

    return {
        message: `Successfully added space`,
        action: null,
    };
};
export const addSpaceTypeDefs = gql`
    input AddSpaceInput {
        name: String!
        maximumCapacity: Int!
        numberOfSeats: Int!
        spaceSize: Float
        spacePricePlan: SpacePricePlan
        nearestStations: [NearestStations]
        space_To_Space_Types: [Space_to_Space_Types]
    }
    input SpacePricePlan {
        planTitle: String
        hourlyPrice: Float
        dailyPrice: Float
        maintenanceFee: Float
        lastMinuteDiscount: Float
        cooldownTime: Int
    }

    input NearestStations {
        stationId: Int!
        via: String
        time: Int
    }

    input Space_to_Space_Types {
        spaceTypeId: String!
    }
    type Mutation {
        addSpace(input: AddSpaceInput!): Result! @auth(requires: [host])
    }
`;

export const addSpaceResolvers = {
    Mutation: { addSpace },
};
