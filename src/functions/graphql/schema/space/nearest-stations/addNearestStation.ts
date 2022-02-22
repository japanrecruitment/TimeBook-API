import { IFieldResolver } from "@graphql-tools/utils";
import { gql } from "apollo-server-core";
import { mapSelections } from "graphql-map-selections";
import { merge } from "lodash";
import { GqlError } from "../../../error";
import { Context } from "../../../context";
import { Result } from "../../core/result";
import { NearestStationObject, toNearestStationSelect } from "./NearestStationObject";

type AddNearestStationInput = {
    stationId: number;
    via: string;
    time: number;
};

type AddNearestStationsArgs = { spaceId: string; stations: AddNearestStationInput[] };

type AddNearestStationsResult = {
    result: Result;
    nearestStations: NearestStationObject[];
};

type AddNearestStations = IFieldResolver<any, Context, AddNearestStationsArgs, Promise<AddNearestStationsResult>>;

const addNearestStations: AddNearestStations = async (
    _,
    { spaceId, stations },
    { authData, dataSources, store },
    info
) => {
    const { accountId } = authData;

    if (!stations || stations.length <= 0)
        throw new GqlError({ code: "BAD_USER_INPUT", message: "Please select some stations to add" });

    stations.forEach((station, index) => {
        const hasDuplicateStation = stations.slice(index + 1).some((s) => s.stationId === station.stationId);
        if (hasDuplicateStation)
            throw new GqlError({
                code: "BAD_USER_INPUT",
                message: "Multiple station with the same id found in the selection",
            });
    });

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

    if (nearestStationToAdd.length <= 0)
        throw new GqlError({ message: `No new station found from submitted station list to add` });

    const updatedSpace = await store.space.update({
        where: { id: spaceId },
        data: { nearestStations: { createMany: { data: nearestStationToAdd } } },
        select: {
            id: true,
            published: true,
            nearestStations: merge(toNearestStationSelect(mapSelections(info).nearestStations), {
                select: { stationId: true },
            }),
        },
    });

    if (updatedSpace.published) {
        await dataSources.spaceAlgolia.partialUpdateObject({
            objectID: updatedSpace.id,
            nearestStations: updatedSpace.nearestStations.map(({ stationId }) => stationId),
        });
    }

    return {
        nearestStations: updatedSpace.nearestStations,
        result: { message: `Successfully added ${nearestStationToAdd.length} new nearest station in your space` },
    };
};

export const addNearestStationsTypeDefs = gql`
    input AddNearestStationInput {
        stationId: IntID!
        via: String!
        time: Int!
    }

    type AddNearestStationsResult {
        result: Result
        nearestStations: [NearestStationObject]
    }

    type Mutation {
        addNearestStations(spaceId: ID!, stations: [AddNearestStationInput]!): AddNearestStationsResult!
            @auth(requires: [user, host])
    }
`;

export const addNearestStationsResolvers = {
    Mutation: { addNearestStations },
};
