import { gql } from "apollo-server-core";
import { Context } from "../../context";
import { IFieldResolver } from "@graphql-tools/utils";
import { GqlError } from "../../error";
import { Result } from "../core/result";

type UpdateSpaceInput = {
    id: string;
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
    spaceId: number;
};

type Space_to_Space_Types = {
    spaceTypeId: string;
};

type UpdateMySpace = IFieldResolver<any, Context, Record<"input", UpdateSpaceInput>, Promise<Result>>;

const updateMySpace: UpdateMySpace = async (_, { input }, { authData, store }) => {
    const { accountId } = authData;
    const {
        name,
        maximumCapacity,
        numberOfSeats,
        spaceSize,
        spacePricePlan,
        nearestStations,
        space_To_Space_Types,
        id,
    } = input;
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

    const spaceFromSpaceId = await store.space.findFirst({
        where: { id },
        select: {
            accountId: true,
            spaceTypes: {
                select: {
                    spaceTypeId: true,
                },
            },
            nearestStations: true,
        },
    });

    if (accountId !== spaceFromSpaceId.accountId)
        throw new GqlError({ code: "FORBIDDEN", message: "You are not allowed to modify this space" });
    const prevoiusSpaceTypes = spaceFromSpaceId.spaceTypes;

    const spaceTypesToAdd = prevoiusSpaceTypes.filter(
        (ps) => !space_To_Space_Types.find((rm) => rm.spaceTypeId === ps.spaceTypeId)
    );

    const spaceTypesToDelete = space_To_Space_Types.filter(
        (ar) => !prevoiusSpaceTypes.find((rm) => rm.spaceTypeId === ar.spaceTypeId).spaceTypeId
    );

    const previousStations = spaceFromSpaceId.nearestStations;
    const stationsToAdd = nearestStations.filter((x) => x.spaceId == null);
    const stationsToUpdate = previousStations.filter((ar) =>
        previousStations.find((rm) => rm.stationId === ar.stationId)
    );
    const stationsToDelete = previousStations.filter(
        (ar) => !previousStations.find((rm) => rm.stationId === ar.stationId)
    );
    await store.space.update({
        where: { id },
        data: {
            name,
            maximumCapacity,
            numberOfSeats,
            spaceSize,
            accountId,
            spacePricePlans: {
                update: {
                    planTitle,
                    hourlyPrice,
                    dailyPrice,
                    maintenanceFee,
                    lastMinuteDiscount,
                    cooldownTime,
                },
            },
            spaceTypes: {
                // deleteMany: { data:spaceTypesToDelete },
                createMany: { data: spaceTypesToAdd },
            },
            nearestStations: {
                createMany: { data: stationsToAdd },
            },
        },
    });

    return { message: `Successfully added space` };
};
// export const updateSpaceTypeTypeDefs = gql`
//     input UpdateMySpaceInput {
//         id: ID!
//         name: String!
//         maximumCapacity: Int!
//         numberOfSeats: Int!
//         spaceSize: Float
//         spacePricePlan: SpacePricePlan
//         nearestStations: [NearestStations]
//         space_To_Space_Types: [Space_to_Space_Types]
//     }

//     type Mutation {
//         updateMySpace(input: UpdateSpaceTypeInput!): Result! @auth(requires: [user, host])
//     }
// `;

// export const updateMySpaceResolvers = {
//     Mutation: { updateMySpace },
// };
