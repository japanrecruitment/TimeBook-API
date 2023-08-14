import { IFieldResolver } from "@graphql-tools/utils";
import { gql } from "apollo-server-core";
import { GqlError } from "../../../error";
import { Context } from "../../../context";
import { Result } from "../../core/result";
import { Log } from "@utils/logger";
import { differenceWith, intersectionWith, isEmpty } from "lodash";

type RemoveHotelNearestStationArgs = { hotelId: string; stationIds: number[] };

type RemoveHotelNearestStationResult = Promise<Result>;

type RemoveHotelNearestStation = IFieldResolver<
    any,
    Context,
    RemoveHotelNearestStationArgs,
    RemoveHotelNearestStationResult
>;

const removeHotelNearestStation: RemoveHotelNearestStation = async (
    _,
    { hotelId, stationIds },
    { authData, dataSources, store }
) => {
    const { accountId } = authData || {};
    if (!accountId) throw new GqlError({ code: "FORBIDDEN", message: "無効なリクエスト" });

    stationIds = stationIds && stationIds.length > 0 ? stationIds : undefined;

    const hotel = await store.hotel.findFirst({
        where: { id: hotelId, accountId },
        select: { nearestStations: { where: { stationId: { in: stationIds } }, select: { stationId: true } } },
    });
    if (!hotel) throw new GqlError({ code: "NOT_FOUND", message: "宿泊施設が見つかりません。" });

    if (isEmpty(hotel.nearestStations)) throw new GqlError({ code: "NOT_FOUND", message: "最寄駅が見つかりません。" });

    const nearestStationsToRemove = stationIds
        ? intersectionWith(stationIds, hotel.nearestStations, (id, { stationId }) => id === stationId)
        : hotel.nearestStations.map(({ stationId }) => stationId);

    const updatedHotel = await store.hotel.update({
        where: { id: hotelId },
        data: { nearestStations: { deleteMany: { hotelId, stationId: { in: nearestStationsToRemove } } } },
        select: { id: true, status: true, nearestStations: { select: { stationId: true } } },
    });

    Log(updatedHotel);
    if (updatedHotel.status === "PUBLISHED") {
        await dataSources.hotelAlgolia.partialUpdateObject({
            objectID: updatedHotel.id,
            nearestStations: updatedHotel.nearestStations.map(({ stationId }) => stationId),
        });
    }

    return {
        message: `${nearestStationsToRemove.length} 駅を宿泊施設の最寄りの駅として削除しました`,
    };
};

export const removeHotelNearestStationTypeDefs = gql`
    type Mutation {
        removeHotelNearestStation(hotelId: ID!, stationIds: [IntID]): Result @auth(requires: [host])
    }
`;

export const removeHotelNearestStationResolvers = { Mutation: { removeHotelNearestStation } };
