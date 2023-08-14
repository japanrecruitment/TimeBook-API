import { IFieldResolver } from "@graphql-tools/utils";
import { S3Lib } from "@libs/S3";
import { Log } from "@utils/logger";
import { gql } from "apollo-server-core";
import { differenceWith } from "lodash";
import { Context } from "../../../context";
import { GqlError } from "../../../error";
import { ImageUploadInput, ImageUploadResult } from "../../media";

type AddHotelRoomPhotosArgs = {
    hotelRoomId: string;
    photos: ImageUploadInput[];
};

type AddHotelRoomPhotosResult = {
    message: string;
    uploadRes?: ImageUploadResult[];
};

type AddHotelRoomPhotos = IFieldResolver<any, Context, AddHotelRoomPhotosArgs, Promise<AddHotelRoomPhotosResult>>;

const addHotelRoomPhotos: AddHotelRoomPhotos = async (_, { hotelRoomId, photos }, { authData, store }) => {
    const { accountId } = authData || {};
    if (!accountId) throw new GqlError({ code: "FORBIDDEN", message: "無効なリクエスト" });

    const hotelRoom = await store.hotelRoom.findUnique({
        where: { id: hotelRoomId },
        select: { hotel: { select: { accountId: true } }, photos: { select: { id: true } } },
    });
    if (!hotelRoom) throw new GqlError({ code: "NOT_FOUND", message: "部屋が見つかりません" });

    if (accountId !== hotelRoom.hotel.accountId) throw new GqlError({ code: "FORBIDDEN", message: "無効なリクエスト" });

    const updatedHotelRoom = await store.hotelRoom.update({
        where: { id: hotelRoomId },
        data: {
            photos: { createMany: { data: photos.map(({ mime }) => ({ mime: mime || "image/jpeg", type: "Cover" })) } },
        },
        select: { photos: true },
    });

    const newPhotos = differenceWith(updatedHotelRoom.photos, hotelRoom.photos, (a, b) => a.id === b.id);

    const S3 = new S3Lib("upload");
    const uploadRes = newPhotos
        ?.filter(({ medium, small, large }) => !medium && !small && !large)
        .map(({ id, mime, type }) => {
            const key = `${id}.${mime.split("/")[1]}`;
            const url = S3.getUploadUrl(key, mime, 60 * 10);
            return { key, mime, type, url };
        });

    Log(updatedHotelRoom, uploadRes);

    return {
        message: `写真がアップロードされました`,
        uploadRes,
    };
};

export const addHotelRoomPhotosTypeDefs = gql`
    type AddHotelRoomPhotosResult {
        message: String!
        uploadRes: [ImageUploadResult]
    }

    type Mutation {
        addHotelRoomPhotos(hotelRoomId: ID!, photos: [ImageUploadInput!]!): AddHotelRoomPhotosResult
            @auth(requires: [host])
    }
`;

export const addHotelRoomPhotosResolvers = { Mutation: { addHotelRoomPhotos } };
