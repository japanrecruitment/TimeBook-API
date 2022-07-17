import { IFieldResolver } from "@graphql-tools/utils";
import { gql } from "apollo-server-core";
import { GqlError } from "../../../error";
import { Context } from "../../../context";
import { Result } from "../../core/result";
import { Log } from "@utils/logger";

type RemoveHotelNearestStationArgs = { hotelId: string; stationId: number };

type RemoveHotelNearestStationResult = Promise<Result>;

type RemoveHotelNearestStation = IFieldResolver<
    any,
    Context,
    RemoveHotelNearestStationArgs,
    RemoveHotelNearestStationResult
>;

const removeHotelNearestStation: RemoveHotelNearestStation = async (_, { hotelId, stationId }, { authData, store }) => {
    const { accountId } = authData || {};
    if (!accountId) throw new GqlError({ code: "FORBIDDEN", message: "Invalid token!!" });

    const nearestStation = await store.hotelNearestStation.findUnique({
        where: { hotelId_stationId: { hotelId, stationId } },
        select: { hotel: { select: { accountId: true } }, station: { select: { stationName: true } } },
    });
    if (!nearestStation) throw new GqlError({ code: "NOT_FOUND", message: "Nearest station not found" });

    if (accountId !== nearestStation.hotel.accountId)
        throw new GqlError({ code: "FORBIDDEN", message: "You are not allowed to modify this hotel" });

    const updatedHotel = await store.hotel.update({
        where: { id: hotelId },
        data: { nearestStations: { delete: { hotelId_stationId: { hotelId, stationId } } } },
    });

    Log(updatedHotel);

    return {
        message: `Successfully removed ${nearestStation.station.stationName} as nearest station from your hotel`,
    };
};

export const removeHotelNearestStationTypeDefs = gql`
    type Mutation {
        removeHotelNearestStation(hotelId: ID!, stationId: IntID!): Result @auth(requires: [host])
    }
`;

export const removeHotelNearestStationResolvers = { Mutation: { removeHotelNearestStation } };
