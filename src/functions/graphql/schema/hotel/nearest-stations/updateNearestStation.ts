import { IFieldResolver } from "@graphql-tools/utils";
import { Log } from "@utils/logger";
import { gql } from "apollo-server-core";
import { mapSelections } from "graphql-map-selections";
import { isEmpty, isNaN } from "lodash";
import { Context } from "src/functions/graphql/context";
import { GqlError } from "src/functions/graphql/error";
import { HotelNearestStationObject, toHotelNearestStationSelect } from "./HotelNearestStationObject";

export function validateUpdateHotelNearestStationInput(
    input: UpdateHotelNearestStationInput
): UpdateHotelNearestStationInput {
    let { hotelId, stationId, accessType, time } = input;

    hotelId = hotelId?.trim();
    accessType = accessType?.trim();

    if (isEmpty(hotelId)) throw new GqlError({ code: "BAD_USER_INPUT", message: "Invalid hotel id provided" });

    if (isNaN(stationId)) throw new GqlError({ code: "BAD_USER_INPUT", message: "Invalid station id provided" });

    if (accessType === "") accessType = undefined;

    if (time && time < 0) throw new GqlError({ code: "BAD_USER_INPUT", message: "Invalid time" });

    if (!accessType && !time) throw new GqlError({ code: "BAD_USER_INPUT", message: "Empty Input" });

    return { accessType, hotelId, stationId, time };
}

type UpdateHotelNearestStationInput = {
    hotelId: string;
    stationId: number;
    accessType?: string;
    time?: number;
};

type UpdateHotelNearestStationArgs = { input: UpdateHotelNearestStationInput };

type UpdateHotelNearestStationResult = {
    message: string;
    nearestStation?: HotelNearestStationObject;
};

type UpdateHotelNearestStation = IFieldResolver<
    any,
    Context,
    UpdateHotelNearestStationArgs,
    Promise<UpdateHotelNearestStationResult>
>;

const updateHotelNearestStation: UpdateHotelNearestStation = async (_, { input }, { authData, store }, info) => {
    const { accountId } = authData || {};
    if (!accountId) throw new GqlError({ code: "FORBIDDEN", message: "Invalid token!!" });

    const validInput = validateUpdateHotelNearestStationInput(input);
    const { hotelId, stationId, accessType, time } = validInput;

    const nearestStation = await store.hotelNearestStation.findUnique({
        where: { hotelId_stationId: { hotelId, stationId } },
        select: { hotel: { select: { accountId: true } } },
    });
    if (!nearestStation) throw new GqlError({ code: "NOT_FOUND", message: "Nearest station not found" });

    if (accountId !== nearestStation.hotel.accountId)
        throw new GqlError({ code: "FORBIDDEN", message: "You are not allowed to modify this hotel" });

    const nearestStationSelect = toHotelNearestStationSelect(mapSelections(info)?.nearestStation).select;
    const updatedNearestStation = await store.hotelNearestStation.update({
        where: { hotelId_stationId: { hotelId, stationId } },
        data: { accessType, time },
        select: nearestStationSelect,
    });

    Log(updatedNearestStation);

    return { message: `Successfully updated nearest station`, nearestStation: updatedNearestStation };
};

export const updateHotelNearestStationTypeDefs = gql`
    input UpdateHotelNearestStationInput {
        hotelId: ID!
        stationId: IntID!
        accessType: String
        time: Int
    }

    type UpdateHotelNearestStationResult {
        message: String!
        nearestStation: HotelNearestStationObject
    }

    type Mutation {
        updateHotelNearestStation(input: UpdateHotelNearestStationInput!): UpdateHotelNearestStationResult
            @auth(requires: [host])
    }
`;

export const updateHotelNearestStationResolvers = { Mutation: { updateHotelNearestStation } };
