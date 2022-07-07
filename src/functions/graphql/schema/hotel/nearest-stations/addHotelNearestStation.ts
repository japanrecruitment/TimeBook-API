import { gql } from "apollo-server-core";
import { isEmpty } from "lodash";
import { GqlError } from "../../../error";

export function validateHotelNearestStationInput(input: AddHotelNearestStationInput): AddHotelNearestStationInput {
    let { accessType, stationId, time } = input;

    accessType = accessType.trim();

    if (isEmpty(accessType)) throw new GqlError({ code: "BAD_USER_INPUT", message: "Access type cannot be empty" });

    return { accessType, stationId, time };
}

export function validateHotelNearestStationInputList(
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

    return input.map(validateHotelNearestStationInput);
}

export type AddHotelNearestStationInput = {
    stationId: number;
    accessType: string;
    time: number;
};

export const addHotelNearestStationTypeDefs = gql`
    input AddHotelNearestStationInput {
        stationId: IntID!
        accessType: String!
        time: Int!
    }
`;

export const addHotelNearestStationResolvers = {};
