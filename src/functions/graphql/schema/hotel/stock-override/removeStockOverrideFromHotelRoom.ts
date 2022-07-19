import { IFieldResolver } from "@graphql-tools/utils";
import { Log } from "@utils/logger";
import { gql } from "apollo-server-core";
import { compact, intersectionWith, isEmpty } from "lodash";
import { Context } from "../../../context";
import { GqlError } from "../../../error";
import { Result } from "../../core/result";

type RemoveStockOverrideFromHotelRoomArgs = { hotelRoomId: string; stockOverrideIds: string[] };

type RemoveStockOverrideFromHotelRoomResult = Promise<Result>;

type RemoveStockOverrideFromHotelRoom = IFieldResolver<
    any,
    Context,
    RemoveStockOverrideFromHotelRoomArgs,
    RemoveStockOverrideFromHotelRoomResult
>;

const removeStockOverrideFromHotelRoom: RemoveStockOverrideFromHotelRoom = async (
    _,
    { hotelRoomId, stockOverrideIds },
    { authData, store }
) => {
    const { accountId } = authData || {};
    if (!accountId) throw new GqlError({ code: "FORBIDDEN", message: "Invalid token!!" });

    stockOverrideIds = compact(stockOverrideIds);
    stockOverrideIds = isEmpty(stockOverrideIds) ? undefined : stockOverrideIds;

    const hotelRoom = await store.hotelRoom.findUnique({
        where: { id: hotelRoomId },
        select: {
            hotel: { select: { accountId: true } },
            stockOverrides: { where: { id: { in: stockOverrideIds } }, select: { id: true } },
        },
    });
    if (!hotelRoom || !hotelRoom.hotel) throw new GqlError({ code: "NOT_FOUND", message: "Hotel room not found" });
    if (accountId !== hotelRoom.hotel.accountId)
        throw new GqlError({ code: "FORBIDDEN", message: "You are not allowed to modify this hotel room" });
    if (isEmpty(hotelRoom.stockOverrides))
        throw new GqlError({ code: "BAD_REQUEST", message: "Stock override not found." });

    const stockOverridesToRemove = stockOverrideIds
        ? intersectionWith(stockOverrideIds, hotelRoom.stockOverrides, (a, b) => a === b.id)
        : hotelRoom.stockOverrides.map(({ id }) => id);

    const updatedHotelRoom = await store.hotelRoom.update({
        where: { id: hotelRoomId },
        data: { stockOverrides: { deleteMany: { hotelRoomId, id: { in: stockOverridesToRemove } } } },
    });

    Log(updatedHotelRoom);

    return {
        message: `Successfully removed ${stockOverridesToRemove.length} stock overrides from your hotel room`,
        stockOverride: updatedHotelRoom,
    };
};

export const removeStockOverrideFromHotelRoomTypeDefs = gql`
    type Mutation {
        removeStockOverrideFromHotelRoom(hotelRoomId: ID!, stockOverrideIds: [ID]): Result! @auth(requires: [host])
    }
`;

export const removeStockOverrideFromHotelRoomResolvers = { Mutation: { removeStockOverrideFromHotelRoom } };
