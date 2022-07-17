import { IFieldResolver } from "@graphql-tools/utils";
import { S3Lib } from "@libs/S3";
import { Log } from "@utils/logger";
import { gql } from "apollo-server-core";
import { Context } from "../../context";
import { GqlError } from "../../error";
import { ImageUploadInput, ImageUploadResult } from "../media";

type AddHotelPhotosArgs = {
    hotelId: string;
    photos: ImageUploadInput[];
};

type AddHotelPhotosResult = {
    message: string;
    uploadRes?: ImageUploadResult[];
};

type AddHotelPhotos = IFieldResolver<any, Context, AddHotelPhotosArgs, Promise<AddHotelPhotosResult>>;

const addHotelPhotos: AddHotelPhotos = async (_, { hotelId, photos }, { authData, store }) => {
    const { accountId } = authData || {};
    if (!accountId) throw new GqlError({ code: "FORBIDDEN", message: "Invalid token!!" });

    const hotel = await store.hotel.findFirst({ where: { id: hotelId, accountId } });
    if (!hotel) throw new GqlError({ code: "NOT_FOUND", message: "Hotel not found" });

    const updatedHotel = await store.hotel.update({
        where: { id: hotelId },
        data: {
            photos: { createMany: { data: photos.map(({ mime }) => ({ mime: mime || "image/jpeg", type: "Cover" })) } },
        },
        select: { photos: true },
    });

    const S3 = new S3Lib("upload");
    const uploadRes = updatedHotel.photos
        ?.filter(({ medium, small, large }) => !medium && !small && !large)
        .map(({ id, mime, type }) => {
            const key = `${id}.${mime.split("/")[1]}`;
            const url = S3.getUploadUrl(key, mime, 60 * 10);
            return { key, mime, type, url };
        });

    Log(updatedHotel, uploadRes);

    return {
        message: `Photo uploaded sucessfully!!`,
        uploadRes,
    };
};

export const addHotelPhotosTypeDefs = gql`
    type AddHotelPhotosResult {
        message: String!
        uploadRes: [ImageUploadResult]
    }

    type Mutation {
        addHotelPhotos(hotelId: ID!, photos: [ImageUploadInput!]!): AddHotelPhotosResult @auth(requires: [host])
    }
`;

export const addHotelPhotosResolvers = { Mutation: { addHotelPhotos } };
