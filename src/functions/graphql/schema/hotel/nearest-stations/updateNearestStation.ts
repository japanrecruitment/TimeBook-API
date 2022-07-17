import { IFieldResolver } from "@graphql-tools/utils";
import { gql } from "apollo-server-core";
import { isEmpty } from "lodash";
import { Context } from "src/functions/graphql/context";
import { GqlError } from "src/functions/graphql/error";
import { Result } from "../../core/result";
import { HotelNearestStationObject } from "./HotelNearestStationObject";

export function validateUpdateHotelNearestStationInput(
    input: UpdateHotelNearestStationInput
): UpdateHotelNearestStationInput {
    let { hotelId, stationId, accessType, time } = input;

    accessType = accessType?.trim();

    if (accessType === "") accessType = undefined;

    if (time && time < 0) throw new GqlError({ code: "BAD_USER_INPUT", message: "Invalid time" });

    return { accessType, hotelId, stationId, time };
}

type UpdateHotelNearestStationInput = {
    hotelId: string;
    stationId: number;
    accessType?: string;
    time?: number;
};

type UpdateHotelNearestStationArgs = { input: UpdateHotelNearestStationInput };

type UpdateHotelNearestStationResult = Promise<Result>;

type UpdateHotelNearestStation = IFieldResolver<
    any,
    Context,
    UpdateHotelNearestStationArgs,
    UpdateHotelNearestStationResult
>;

const updateHotelNearestStation: UpdateHotelNearestStation = async (_, { input }, { authData, store }, info) => {
    const { accountId } = authData || {};
    if (!accountId) throw new GqlError({ code: "FORBIDDEN", message: "Invalid token!!" });

    const validInput = validateUpdateHotelNearestStationInput(input);
    const { hotelId, stationId, accessType, time } = validInput;

    if (!accessType && !time) return { message: `Successfully updated nearest station` };

    const nearestStation = await store.hotelNearestStation.findUnique({
        where: { hotelId_stationId: { hotelId, stationId } },
        select: { hotel: { select: { accountId: true } } },
    });
    if (!nearestStation) throw new GqlError({ code: "NOT_FOUND", message: "Nearest station not found" });

    if (accountId !== nearestStation.hotel.accountId)
        throw new GqlError({ code: "FORBIDDEN", message: "You are not allowed to modify this hotel" });

    await store.hotelNearestStation.update({
        where: { hotelId_stationId: { hotelId, stationId } },
        data: { accessType, time },
    });

    return { message: `Successfully updated nearest station` };
};

export const updateHotelNearestStationTypeDefs = gql`
    input UpdateHotelNearestStationInput {
        hotelId: ID!
        stationId: IntID!
        accessType: String
        time: Int
    }

    type Mutation {
        updateHotelNearestStation(input: UpdateHotelNearestStationInput!): Result @auth(requires: [host])
    }
`;

export const updateHotelNearestStationResolvers = { Mutation: { updateHotelNearestStation } };
