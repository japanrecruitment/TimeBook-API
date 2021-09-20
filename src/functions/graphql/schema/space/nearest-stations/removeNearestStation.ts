import { IFieldResolver } from "@graphql-tools/utils";
import { gql } from "apollo-server-express";
import { GqlError } from "src/functions/graphql/error";
import { Context } from "../../../context";
import { Result } from "../../core/result";

type RemoveNearestStationInput = {
    spaceId: string;
    stationId: number;
};

type RemoveNearestStationArgs = { input: RemoveNearestStationInput };

type RemoveNearestStationResult = Promise<Result>;

type RemoveNearestStation = IFieldResolver<any, Context, RemoveNearestStationArgs, RemoveNearestStationResult>;

const removeNearestStation: RemoveNearestStation = async (_, { input }, { authData, dataSources, store }) => {
    const { accountId } = authData;
    const { spaceId, stationId } = input;

    const nearestStation = await store.nearestStation.findUnique({
        where: { spaceId_stationId: { spaceId, stationId } },
        select: {
            space: { select: { accountId: true, nearestStations: { select: { stationId: true } } } },
            station: { select: { stationName: true } },
        },
    });

    if (!nearestStation) throw new GqlError({ code: "NOT_FOUND", message: "Nearest station not found" });

    if (accountId !== nearestStation.space.accountId)
        throw new GqlError({ code: "FORBIDDEN", message: "You are not allowed to modify this space" });

    const updatedSpace = await store.space.update({
        where: { id: spaceId },
        data: { nearestStations: { delete: { spaceId_stationId: { spaceId, stationId } } } },
        select: { id: true, nearestStations: { select: { stationId: true } } },
    });

    await dataSources.spaceAlgolia.partialUpdateObject({
        objectID: updatedSpace.id,
        nearestStations: updatedSpace.nearestStations.map(({ stationId }) => stationId),
    });

    return { message: `Successfully removed ${nearestStation.station.stationName} as nearest station from your space` };
};

export const removeNearestStationTypeDefs = gql`
    input RemoveNearestStationInput {
        spaceId: ID!
        stationId: IntID!
    }

    type Mutation {
        removeNearestStation(input: RemoveNearestStationInput!): Result! @auth(requires: [user, host])
    }
`;

export const removeNearestStationResolvers = {
    Mutation: { removeNearestStation },
};
