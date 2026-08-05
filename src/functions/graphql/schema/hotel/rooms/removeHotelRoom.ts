import { IFieldResolver } from "@graphql-tools/utils";
import { gql } from "apollo-server-core";
import { Context } from "../../../context";
import { GqlError } from "../../../error";
import { Result } from "../../core/result";

type RemoveHotelRoomArgs = { id: string };

type RemoveHotelRoomResult = Result;

type RemoveHotelRoom = IFieldResolver<any, Context, RemoveHotelRoomArgs, Promise<RemoveHotelRoomResult>>;

const removeHotelRoom: RemoveHotelRoom = async (_, { id }, { authData, store }) => {
    const { accountId } = authData || {};
    if (!accountId) throw new GqlError({ code: "FORBIDDEN", message: "無効なリクエスト" });

    const hotelRoom = await store.hotelRoom.findFirst({
        where: { id, hotel: { accountId } },
        select: { name: true },
    });
    if (!hotelRoom) throw new GqlError({ code: "NOT_FOUND", message: "部屋タイプが見つかりません。" });

    // Block deletion while active reservations exist for this room type
    const activeReservations = await store.hotelRoomReservation.count({
        where: { hotelRoomId: id, status: { in: ["RESERVED", "HOLD", "PENDING"] } },
    });
    if (activeReservations > 0)
        throw new GqlError({
            code: "BAD_REQUEST",
            message: `「${hotelRoom.name}」部屋タイプには有効な予約が${activeReservations}件あるため、削除できません。予約の完了またはキャンセル後に再度お試しください。`,
        });

    // Cascade deletes (package plan links, price settings/overrides, photos, etc.) are handled by the schema
    await store.hotelRoom.delete({ where: { id } });

    return { message: `「${hotelRoom.name}」部屋タイプが削除されました` };
};

export const removeHotelRoomTypeDefs = gql`
    type Mutation {
        removeHotelRoom(id: ID!): Result! @auth(requires: [host])
    }
`;

export const removeHotelRoomResolvers = { Mutation: { removeHotelRoom } };
