import { IFieldResolver } from "@graphql-tools/utils";
import { Log } from "@utils/logger";
import { gql } from "apollo-server-core";
import { mapSelections } from "graphql-map-selections";
import { differenceWith, isEmpty } from "lodash";
import { Context } from "../../../context";
import { GqlError } from "../../../error";
import { HotelNearestStationObject, toHotelNearestStationSelect } from "./HotelNearestStationObject";

export function validateAddHotelNearestStationInput(input: AddHotelNearestStationInput): AddHotelNearestStationInput {
    let { accessType, stationId, time } = input;

    accessType = accessType.trim();

    if (isEmpty(accessType)) throw new GqlError({ code: "BAD_USER_INPUT", message: "Access type cannot be empty" });

    return { accessType, stationId, time };
}

export function validateAddHotelNearestStationInputList(
    input: AddHotelNearestStationInput[]
): AddHotelNearestStationInput[] {
    if (!input || input.length <= 0)
        throw new GqlError({ code: "BAD_USER_INPUT", message: "Please select some stations to add" });

    input.forEach((station, index) => {
        const hasDuplicateStation = input.slice(index + 1).some((s) => s.stationId === station.stationId);
        if (hasDuplicateStation)
            throw new GqlError({
                code: "BAD_USER_INPUT",
                message: "Multiple station with the same id found in the selection",
            });
    });

    return input.map(validateAddHotelNearestStationInput);
}

export type AddHotelNearestStationInput = {
    stationId: number;
    accessType: string;
    time: number;
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
    { authData, store },
    info
) => {
    const { accountId } = authData || {};
    if (!accountId) throw new GqlError({ code: "FORBIDDEN", message: "Invalid token!!" });

    const validStations = validateAddHotelNearestStationInputList(stations);

    const mStations = await store.station.findMany({
        where: { id: { in: validStations.map(({ stationId }) => stationId) } },
        select: { id: true },
    });
    differenceWith(validStations, mStations, ({ stationId }, { id }) => stationId === id).forEach(({ stationId }) => {
        throw new GqlError({ code: "NOT_FOUND", message: `Cannot find station with id: ${stationId}` });
    });

    const hotel = await store.hotel.findFirst({
        where: { id: hotelId, accountId },
        select: { nearestStations: { select: { stationId: true } } },
    });
    if (!hotel) throw new GqlError({ code: "NOT_FOUND", message: "Hotel not found" });

    const nearestStationsToAdd = differenceWith(
        validStations,
        hotel.nearestStations,
        (a, b) => a.stationId === b.stationId
    );

    if (nearestStationsToAdd.length <= 0)
        throw new GqlError({ message: `No new station found from submitted station list to add` });

    const nearestStationSelect = toHotelNearestStationSelect(mapSelections(info)?.nearestStations);
    const updatedHotel = await store.hotel.update({
        where: { id: hotelId },
        data: { nearestStations: { createMany: { data: nearestStationsToAdd } } },
        select: { nearestStations: nearestStationSelect },
    });

    Log(updatedHotel);

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
