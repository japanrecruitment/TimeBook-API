import { IFieldResolver } from "@graphql-tools/utils";
import { Log } from "@utils/logger";
import { gql } from "apollo-server-core";
import { mapSelections } from "graphql-map-selections";
import { differenceWith, isEmpty, uniqWith } from "lodash";
import { Context } from "../../../context";
import { GqlError } from "../../../error";
import { HotelNearestStationObject, toHotelNearestStationSelect } from "./HotelNearestStationObject";

export function validateAddHotelNearestStationInput(input: AddHotelNearestStationInput): AddHotelNearestStationInput {
    let { accessType, stationId, time, exit } = input;

    accessType = accessType.trim();

    if (isEmpty(accessType)) throw new GqlError({ code: "BAD_USER_INPUT", message: "Access type cannot be empty" });

    exit = exit?.trim();

    return { accessType, stationId, time, exit };
}

export function validateAddHotelNearestStationInputList(
    input: AddHotelNearestStationInput[]
): AddHotelNearestStationInput[] {
    if (!input || input.length <= 0)
        throw new GqlError({ code: "BAD_USER_INPUT", message: "Please select some stations to add" });

    const duplicateStations = differenceWith(
        input,
        uniqWith(input, (a, b) => a.stationId === b.stationId),
        (a, b) => a.stationId === b.stationId
    );
    if (!isEmpty(duplicateStations)) {
        const duplicateIds = duplicateStations.map(({ stationId }) => stationId);
        throw new GqlError({
            code: "BAD_USER_INPUT",
            message: `Multiple station with the same ids: ${duplicateIds} found in the selection`,
        });
    }

    return input.map(validateAddHotelNearestStationInput);
}

export type AddHotelNearestStationInput = {
    stationId: number;
    accessType: string;
    time: number;
    exit: string;
};

type AddHotelNearestStationArgs = {
    hotelId: string;
    stations: AddHotelNearestStationInput[];
};

type AddHotelNearestStationResult = Promise<{
    message: string;
    nearestStations?: HotelNearestStationObject[];
}>;

type AddHotelNearestStations = IFieldResolver<any, Context, AddHotelNearestStationArgs, AddHotelNearestStationResult>;

const addHotelNearestStations: AddHotelNearestStations = async (
    _,
    { hotelId, stations },
    { authData, dataSources, store },
    info
) => {
    const { accountId } = authData || {};
    if (!accountId) throw new GqlError({ code: "FORBIDDEN", message: "Invalid token!!" });

    const validStations = validateAddHotelNearestStationInputList(stations);

    const hotel = await store.hotel.findFirst({
        where: { id: hotelId, accountId },
        select: { address: { select: { prefectureId: true } }, nearestStations: { select: { stationId: true } } },
    });
    if (!hotel) throw new GqlError({ code: "NOT_FOUND", message: "Hotel not found" });

    const mStations = await store.station.findMany({
        where: {
            id: { in: validStations.map(({ stationId }) => stationId) },
            prefectureCode: hotel.address.prefectureId,
        },
        select: { id: true },
    });
    differenceWith(validStations, mStations, ({ stationId }, { id }) => stationId === id).forEach(({ stationId }) => {
        throw new GqlError({
            code: "NOT_FOUND",
            message: `Cannot find station with id: ${stationId} in your prefecture`,
        });
    });

    const nearestStationsToAdd = differenceWith(
        validStations,
        hotel.nearestStations,
        (a, b) => a.stationId === b.stationId
    );

    if (nearestStationsToAdd.length <= 0)
        throw new GqlError({ message: `No new station found from submitted station list to add` });

    const nearestStationSelect = toHotelNearestStationSelect(mapSelections(info)?.nearestStations)?.select || {
        station: true,
    };
    const updatedHotel = await store.hotel.update({
        where: { id: hotelId },
        data: { nearestStations: { createMany: { data: nearestStationsToAdd } } },
        select: { id: true, nearestStations: { select: { ...nearestStationSelect, stationId: true } }, status: true },
    });

    Log(updatedHotel);
    if (updatedHotel.status === "PUBLISHED") {
        await dataSources.hotelAlgolia.partialUpdateObject({
            objectID: updatedHotel.id,
            nearestStations: updatedHotel.nearestStations.map(({ stationId }) => stationId),
        });
    }

    return {
        message: `Succesfully added ${nearestStationsToAdd.length} new nearest stations in your hotel`,
        nearestStations: updatedHotel.nearestStations,
    };
};

export const addHotelNearestStationTypeDefs = gql`
    input AddHotelNearestStationInput {
        stationId: IntID!
        accessType: String!
        time: Int!
        exit: String
    }

    type AddHotelNearestStationResult {
        message: String!
        nearestStations: [HotelNearestStationObject]
    }

    type Mutation {
        addHotelNearestStations(hotelId: ID!, stations: [AddHotelNearestStationInput!]!): AddHotelNearestStationResult
            @auth(requires: [host])
    }
`;

export const addHotelNearestStationResolvers = { Mutation: { addHotelNearestStations } };
