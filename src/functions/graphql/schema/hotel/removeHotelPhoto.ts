import { IFieldResolver } from "@graphql-tools/utils";
import { S3Lib } from "@libs/S3";
import { gql } from "apollo-server-core";
import { Context } from "../../context";
import { GqlError } from "../../error";
import { Result } from "../core/result";

type RemoveHotelPhotoArgs = { hotelId: string; photoId: string };

type RemoveHotelPhotoResult = Result;

type RemoveHotelPhoto = IFieldResolver<any, Context, RemoveHotelPhotoArgs, Promise<RemoveHotelPhotoResult>>;

const removeHotelPhoto: RemoveHotelPhoto = async (_, { hotelId, photoId }, { authData, store }) => {
    const { accountId } = authData || {};
    if (!accountId) throw new GqlError({ code: "FORBIDDEN", message: "Invalid token!!" });

    const photo = await store.photo.findFirst({
        where: { id: photoId, hotelId },
        include: { hotel: { select: { accountId: true } } },
    });
    if (!photo) throw new GqlError({ code: "NOT_FOUND", message: "Photo not found" });

    if (accountId !== photo.hotel.accountId)
        throw new GqlError({ code: "FORBIDDEN", message: "You are not allowed to modify this hotel" });

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

    return { message: `Successfully removed hotel photo` };
};

export const removeHotelPhotoTypeDefs = gql`
    type Mutation {
        removeHotelPhoto(hotelId: ID!, photoId: ID!): Result @auth(requires: [host])
    }
`;

export const removeHotelPhotoResolvers = { Mutation: { removeHotelPhoto } };
