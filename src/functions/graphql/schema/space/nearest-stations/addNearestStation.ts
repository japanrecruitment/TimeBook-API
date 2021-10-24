import { IFieldResolver } from "@graphql-tools/utils";
import { gql } from "apollo-server-core";
import { GqlError } from "src/functions/graphql/error";
import { Context } from "../../../context";
import { Result } from "../../core/result";

type AddNearestStationInput = {
    stationId: number;
    via: string;
    time: number;
};

type AddNearestStationsArgs = { spaceId: string; stations: AddNearestStationInput[] };

type AddNearestStationsResult = Promise<Result>;

type AddNearestStations = IFieldResolver<any, Context, AddNearestStationsArgs, AddNearestStationsResult>;

const addNearestStations: AddNearestStations = async (_, { spaceId, stations }, { authData, dataSources, store }) => {
    const { accountId } = authData;

    if (!stations || stations.length <= 0)
        throw new GqlError({ code: "BAD_USER_INPUT", message: "Please select some stations to add" });

    const space = await store.space.findFirst({
        where: { id: spaceId, isDeleted: false },
        select: { accountId: true, nearestStations: { select: { stationId: true } } },
    });

    if (!space) throw new GqlError({ code: "NOT_FOUND", message: "Space not found" });

    if (accountId !== space.accountId)
        throw new GqlError({ code: "FORBIDDEN", message: "You are not allowed to modify this space" });

    const nearestStationsIds = space?.nearestStations?.map(({ stationId }) => stationId);
    const nearestStationToAdd = stations
        .filter(({ stationId }) => !nearestStationsIds.includes(stationId))
        .map(({ stationId, time, via }) => ({ stationId, time, via: via?.trim() }));

    if (nearestStationToAdd.length <= 0) return { message: `No new station found from submitted station list to add` };

    const updatedSpace = await store.space.update({
        where: { id: spaceId },
        data: { nearestStations: { createMany: { data: nearestStationToAdd } } },
        select: { id: true, nearestStations: { select: { stationId: true } } },
    });

    await dataSources.spaceAlgolia.partialUpdateObject({
        objectID: updatedSpace.id,
        nearestStations: updatedSpace.nearestStations.map(({ stationId }) => stationId),
    });

    return { message: `Successfully added ${nearestStationToAdd.length} new nearest station in your space` };
};

export const addNearestStationsTypeDefs = gql`
    input AddNearestStationInput {
        stationId: IntID!
        via: String!
        time: Int!
    }

    type Mutation {
        addNearestStations(spaceId: ID!, stations: [AddNearestStationInput]!): Result! @auth(requires: [user, host])
    }
`;

export const addNearestStationsResolvers = {
    Mutation: { addNearestStations },
};
