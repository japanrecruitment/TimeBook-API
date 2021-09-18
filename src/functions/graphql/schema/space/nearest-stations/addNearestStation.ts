import { IFieldResolver } from "@graphql-tools/utils";
import { gql } from "apollo-server-express";
import { GqlError } from "src/functions/graphql/error";
import { Context } from "../../../context";
import { Result } from "../../core/result";

type AddNearestStationInput = {
    spaceId: string;
    stationId: number;
    via: string;
    time: number;
};

type AddNearestStationArgs = { input: AddNearestStationInput };

type AddNearestStationResult = Promise<Result>;

type AddNearestStation = IFieldResolver<any, Context, AddNearestStationArgs, AddNearestStationResult>;

const addNearestStation: AddNearestStation = async (_, { input }, { authData, dataSources, store }) => {
    const { accountId } = authData;
    const { spaceId, stationId, time, via } = input;

    const space = await store.space.findUnique({
        where: { id: spaceId },
        select: { accountId: true, nearestStations: { select: { stationId: true } } },
    });

    if (!space) throw new GqlError({ code: "NOT_FOUND", message: "Space not found" });

    if (accountId !== space.accountId)
        throw new GqlError({ code: "FORBIDDEN", message: "You are not allowed to modify this space" });

    if (space.nearestStations && space.nearestStations.map(({ stationId }) => stationId).includes(stationId))
        throw new GqlError({ message: `Selected station is already listed as nearest station of this space` });

    const station = await store.station.findUnique({ where: { id: stationId } });

    if (!station) throw new GqlError({ code: "NOT_FOUND", message: "Station not found" });

    if (!time || time < 0) throw new GqlError({ code: "BAD_USER_INPUT", message: "Invalid time" });

    if (!via || !via.trim()) throw new GqlError({ code: "BAD_USER_INPUT", message: "Invalid via" });

    const updatedSpace = await store.space.update({
        where: { id: spaceId },
        data: { nearestStations: { create: { station: { connect: { id: stationId } }, time, via } } },
        select: { id: true, nearestStations: { select: { stationId: true } } },
    });

    await dataSources.spaceAlgolia.partialUpdateObject({
        objectID: updatedSpace.id,
        nearestStations: updatedSpace.nearestStations.map(({ stationId }) => stationId),
    });

    return { message: `Successfully added ${station.stationName} as nearest station in your space` };
};

export const addNearestStationTypeDefs = gql`
    input AddNearestStationInput {
        spaceId: ID!
        stationId: IntID!
        via: String!
        time: Int!
    }

    type Mutation {
        addNearestStation(input: AddNearestStationInput!): Result! @auth(requires: [user, host])
    }
`;

export const addNearestStationResolvers = {
    Mutation: { addNearestStation },
};
