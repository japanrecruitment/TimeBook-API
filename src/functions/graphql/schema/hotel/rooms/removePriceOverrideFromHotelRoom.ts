import { IFieldResolver } from "@graphql-tools/utils";
import { Log } from "@utils/logger";
import { gql } from "apollo-server-core";
import { compact, intersectionWith, isEmpty } from "lodash";
import { Context } from "../../../context";
import { GqlError } from "../../../error";
import { Result } from "../../core/result";

type RemovePriceOverrideFromHotelRoomArgs = { hotelRoomId: string; priceOverrideIds: string[] };

type RemovePriceOverrideFromHotelRoomResult = Promise<Result>;

type RemovePriceOverrideFromHotelRoom = IFieldResolver<
    any,
    Context,
    RemovePriceOverrideFromHotelRoomArgs,
    RemovePriceOverrideFromHotelRoomResult
>;

const removePriceOverrideFromHotelRoom: RemovePriceOverrideFromHotelRoom = async (
    _,
    { hotelRoomId, priceOverrideIds },
    { authData, store }
) => {
    const { accountId } = authData || {};
    if (!accountId) throw new GqlError({ code: "FORBIDDEN", message: "Invalid token!!" });

    priceOverrideIds = compact(priceOverrideIds);
    priceOverrideIds = isEmpty(priceOverrideIds) ? undefined : priceOverrideIds;

    const hotelRoom = await store.hotelRoom.findUnique({
        where: { id: hotelRoomId },
        select: {
            hotel: { select: { accountId: true } },
            priceOverrides: { where: { id: { in: priceOverrideIds } }, select: { id: true } },
        },
    });
    if (!hotelRoom || !hotelRoom.hotel) throw new GqlError({ code: "NOT_FOUND", message: "Hotel room not found" });
    if (accountId !== hotelRoom.hotel.accountId)
        throw new GqlError({ code: "FORBIDDEN", message: "You are not allowed to modify this hotel room" });
    if (isEmpty(hotelRoom.priceOverrides))
        throw new GqlError({ code: "BAD_REQUEST", message: "Price override not found." });

    const priceOverridesToRemove = priceOverrideIds
        ? intersectionWith(priceOverrideIds, hotelRoom.priceOverrides, (a, b) => a === b.id)
        : hotelRoom.priceOverrides.map(({ id }) => id);

    const updatedHotelRoom = await store.hotelRoom.update({
        where: { id: hotelRoomId },
        data: { priceOverrides: { deleteMany: { hotelRoomId, id: { in: priceOverridesToRemove } } } },
    });

    Log(updatedHotelRoom);

    return {
        message: `Successfully removed ${priceOverridesToRemove.length} price overrides from your hotel room`,
        priceOverride: updatedHotelRoom,
    };
};

export const removePriceOverrideFromHotelRoomTypeDefs = gql`
    type Mutation {
        removePriceOverrideFromHotelRoom(hotelRoomId: ID!, priceOverrideIds: [ID]): Result! @auth(requires: [host])
    }
`;

export const removePriceOverrideFromHotelRoomResolvers = { Mutation: { removePriceOverrideFromHotelRoom } };
