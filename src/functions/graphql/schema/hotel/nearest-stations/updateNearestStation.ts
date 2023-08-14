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
    let { hotelId, stationId, accessType, time, exit } = input;

    hotelId = hotelId?.trim();
    accessType = accessType?.trim();
    exit = exit?.trim();

    if (isEmpty(hotelId)) throw new GqlError({ code: "BAD_USER_INPUT", message: "無効なリクエスト" });

    if (isNaN(stationId)) throw new GqlError({ code: "BAD_USER_INPUT", message: "無効な最寄駅" });

    if (accessType === "") accessType = undefined;

    if (time && time < 0) throw new GqlError({ code: "BAD_USER_INPUT", message: "無効な時間" });

    if (!accessType && !time) throw new GqlError({ code: "BAD_USER_INPUT", message: "無効なリクエスト" });

    return { accessType, hotelId, stationId, time, exit };
}

type UpdateHotelNearestStationInput = {
    hotelId: string;
    stationId: number;
    accessType?: string;
    time?: number;
    exit?: string;
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
    if (!accountId) throw new GqlError({ code: "FORBIDDEN", message: "無効なリクエスト" });

    const validInput = validateUpdateHotelNearestStationInput(input);
    const { hotelId, stationId, accessType, time, exit } = validInput;

    const nearestStation = await store.hotelNearestStation.findUnique({
        where: { hotelId_stationId: { hotelId, stationId } },
        select: { hotel: { select: { accountId: true } } },
    });
    if (!nearestStation) throw new GqlError({ code: "NOT_FOUND", message: "最寄駅が見つかりません" });

    if (accountId !== nearestStation.hotel.accountId)
        throw new GqlError({ code: "FORBIDDEN", message: "無効なリクエスト" });

    const nearestStationSelect = toHotelNearestStationSelect(mapSelections(info)?.nearestStation).select;
    const updatedNearestStation = await store.hotelNearestStation.update({
        where: { hotelId_stationId: { hotelId, stationId } },
        data: { accessType, time, exit },
        select: nearestStationSelect,
    });

    Log(updatedNearestStation);

    return { message: `最寄駅を更新しました。`, nearestStation: updatedNearestStation };
};

export const updateHotelNearestStationTypeDefs = gql`
    input UpdateHotelNearestStationInput {
        hotelId: ID!
        stationId: IntID!
        accessType: String
        time: Int
        exit: String
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
