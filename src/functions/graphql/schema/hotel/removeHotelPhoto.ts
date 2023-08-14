import { IFieldResolver } from "@graphql-tools/utils";
import { S3Lib } from "@libs/S3";
import { gql } from "apollo-server-core";
import { Context } from "../../context";
import { GqlError } from "../../error";
import { Result } from "../core/result";

type RemoveHotelPhotoArgs = { photoId: string };

type RemoveHotelPhotoResult = Result;

type RemoveHotelPhoto = IFieldResolver<any, Context, RemoveHotelPhotoArgs, Promise<RemoveHotelPhotoResult>>;

const removeHotelPhoto: RemoveHotelPhoto = async (_, { photoId }, { authData, store }) => {
    const { accountId } = authData || {};
    if (!accountId) throw new GqlError({ code: "FORBIDDEN", message: "無効なリクエスト" });

    const photo = await store.photo.findUnique({
        where: { id: photoId },
        include: { hotel: { select: { accountId: true } } },
    });
    if (!photo || !photo.hotel) throw new GqlError({ code: "NOT_FOUND", message: "写真が見つかりません。" });

    if (accountId !== photo.hotel?.accountId) throw new GqlError({ code: "FORBIDDEN", message: "無効なリクエスト" });

    await store.photo.delete({ where: { id: photoId } });

    const isMedia = photo.large || photo.medium || photo.small || photo.thumbnail ? true : false;

    const s3: S3Lib = new S3Lib(isMedia ? "media" : "upload");

    const key = `${photo.id}.${photo.mime.split("/")[1]}`;

    if (!isMedia) () => s3.deleteObject(key);

    if (isMedia) {
        if (photo.large) s3.deleteObject(`${photo.type}/large/${key}`);
        if (photo.medium) s3.deleteObject(`${photo.type}/medium/${key}`);
        if (photo.small) s3.deleteObject(`${photo.type}/small/${key}`);
        if (photo.thumbnail) s3.deleteObject(`${photo.type}/thumbnail/${key}`);
    }

    return { message: `写真は削除されました。` };
};

export const removeHotelPhotoTypeDefs = gql`
    type Mutation {
        removeHotelPhoto(photoId: ID!): Result @auth(requires: [host])
    }
`;

export const removeHotelPhotoResolvers = { Mutation: { removeHotelPhoto } };
