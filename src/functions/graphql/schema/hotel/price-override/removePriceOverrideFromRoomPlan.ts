import { IFieldResolver } from "@graphql-tools/utils";
import { Log } from "@utils/logger";
import { gql } from "apollo-server-core";
import { compact, intersectionWith, isEmpty } from "lodash";
import { Context } from "../../../context";
import { GqlError } from "../../../error";
import { Result } from "../../core/result";

type RemovePriceOverrideFromRoomPlanArgs = { roomPlanId: string; priceOverrideIds: string[] };

type RemovePriceOverrideFromRoomPlanResult = Promise<Result>;

type RemovePriceOverrideFromRoomPlan = IFieldResolver<
    any,
    Context,
    RemovePriceOverrideFromRoomPlanArgs,
    RemovePriceOverrideFromRoomPlanResult
>;

const removePriceOverrideFromRoomPlan: RemovePriceOverrideFromRoomPlan = async (
    _,
    { roomPlanId, priceOverrideIds },
    { authData, store }
) => {
    const { accountId } = authData || {};
    if (!accountId) throw new GqlError({ code: "FORBIDDEN", message: "Invalid token!!" });

    priceOverrideIds = compact(priceOverrideIds);
    priceOverrideIds = isEmpty(priceOverrideIds) ? undefined : priceOverrideIds;

    const roomPlan = await store.hotelRoom_PackagePlan.findUnique({
        where: { id: roomPlanId },
        select: {
            hotelRoom: { select: { hotel: { select: { accountId: true } } } },
            priceOverrides: { where: { id: { in: priceOverrideIds } }, select: { id: true } },
        },
    });
    if (!roomPlan || !roomPlan.hotelRoom?.hotel)
        throw new GqlError({ code: "NOT_FOUND", message: "Room plan not found" });
    if (accountId !== roomPlan.hotelRoom.hotel.accountId)
        throw new GqlError({ code: "FORBIDDEN", message: "You are not allowed to modify this hotel room" });
    if (isEmpty(roomPlan.priceOverrides))
        throw new GqlError({ code: "BAD_REQUEST", message: "Price override not found." });

    const priceOverridesToRemove = priceOverrideIds
        ? intersectionWith(priceOverrideIds, roomPlan.priceOverrides, (a, b) => a === b.id)
        : roomPlan.priceOverrides.map(({ id }) => id);

    const updatedHotelRoom = await store.hotelRoom_PackagePlan.update({
        where: { id: roomPlanId },
        data: {
            priceOverrides: {
                deleteMany: { hotelRoom_packagePlan_id: roomPlanId, id: { in: priceOverridesToRemove } },
            },
        },
    });

    Log(updatedHotelRoom);

    return {
        message: `Successfully removed ${priceOverridesToRemove.length} price overrides from your hotel room`,
        priceOverride: updatedHotelRoom,
    };
};

export const removePriceOverrideFromRoomPlanTypeDefs = gql`
    type Mutation {
        removePriceOverrideFromRoomPlan(roomPlanId: ID!, priceOverrideIds: [ID]): Result! @auth(requires: [host])
    }
`;

export const removePriceOverrideFromRoomPlanResolvers = { Mutation: { removePriceOverrideFromRoomPlan } };
