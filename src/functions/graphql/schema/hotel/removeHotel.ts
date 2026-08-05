import { IFieldResolver } from "@graphql-tools/utils";
import { Log } from "@utils/logger";
import { gql } from "apollo-server-core";
import { Context } from "../../context";
import { GqlError } from "../../error";
import { Result } from "../core/result";

type RemoveHotelArgs = { id: string };

type RemoveHotelResult = Result;

type RemoveHotel = IFieldResolver<any, Context, RemoveHotelArgs, Promise<RemoveHotelResult>>;

const removeHotel: RemoveHotel = async (_, { id }, { authData, dataSources, store }) => {
    const { accountId } = authData || {};
    if (!accountId) throw new GqlError({ code: "FORBIDDEN", message: "無効なリクエスト" });

    const hotel = await store.hotel.findFirst({
        where: { id, accountId },
        select: { name: true, status: true },
    });
    if (!hotel) throw new GqlError({ code: "NOT_FOUND", message: "宿泊施設が見つかりません。" });

    // Block deletion while active reservations exist for any of this hotel's rooms
    const activeReservations = await store.hotelRoomReservation.count({
        where: { hotelRoom: { hotelId: id }, status: { in: ["RESERVED", "HOLD", "PENDING"] } },
    });
    if (activeReservations > 0)
        throw new GqlError({
            code: "BAD_REQUEST",
            message: `この宿泊施設には有効な予約が${activeReservations}件あるため、削除できません。予約の完了またはキャンセル後に再度お試しください。`,
        });

    // Remove from Algolia first if it is currently published in search
    if (hotel.status === "PUBLISHED") {
        Log("Removing hotel from Algolia...");
        try {
            await dataSources.hotelAlgolia.deleteObject(id);
            Log("Hotel successfully removed from Algolia");
        } catch (algoliaError) {
            Log("Algolia delete error:", algoliaError);
            if (!(algoliaError.message && algoliaError.message.includes("ObjectID does not exist"))) {
                throw new GqlError({ code: "INTERNAL_ERROR", message: "Algoliaでの削除に失敗しました" });
            }
            Log("Object not found in Algolia - this is OK, deleting from DB anyway");
        }
    }

    // Cascade deletes (rooms, package plans, reservations, photos, etc.) are handled by the schema
    await store.hotel.delete({ where: { id } });

    return { message: `「${hotel.name}」宿泊施設が削除されました` };
};

export const removeHotelTypeDefs = gql`
    type Mutation {
        removeHotel(id: ID!): Result! @auth(requires: [host])
    }
`;

export const removeHotelResolvers = { Mutation: { removeHotel } };
