import { IFieldResolver } from "@graphql-tools/utils";
import { S3Lib } from "@libs/S3";
import { gql } from "apollo-server-core";
import { Context } from "../../context";
import { GqlError } from "../../error";
import { ImageUploadInput, ImageUploadResult } from "../media";

type AddSpacePhotosArgs = { spaceId: string; imageInputs: ImageUploadInput[] };

type AddSpacePhotoResult = Promise<ImageUploadResult[]>;

type AddSpacePhotos = IFieldResolver<any, Context, AddSpacePhotosArgs, AddSpacePhotoResult>;

const addSpacePhotos: AddSpacePhotos = async (_, { spaceId, imageInputs }, { store }) => {
    if (imageInputs.length <= 0) throw new GqlError({ code: "BAD_USER_INPUT", message: "無効な写真の種類" });

    const space = await store.space.findUnique({ where: { id: spaceId } });

    if (!space) throw new GqlError({ code: "BAD_REQUEST", message: "スペースが見つかりません" });

    const { photos } = await store.space.update({
        where: { id: spaceId },
        data: {
            photos: {
                createMany: {
                    data: imageInputs.map(({ mime }) => {
                        return { mime: mime || "image/jpeg", type: "Cover" };
                    }),
                },
            },
        },
        select: { photos: true },
    });

    const S3 = new S3Lib("upload");
    const imageUploadResults = photos
        .filter(({ medium, small, large }) => !medium && !small && !large)
        .map(({ id, mime, type }) => {
            const key = `${id}.${mime.split("/")[1]}`;
            const url = S3.getUploadUrl(key, mime, 60 * 10);
            return { key, mime, type, url };
        });

    return imageUploadResults;
};

export const addSpacePhotosTypeDefs = gql`
    type Mutation {
        addSpacePhotos(spaceId: ID!, imageInputs: [ImageUploadInput]!): [ImageUploadResult]
            @auth(requires: [user, host])
    }
`;

export const addSpacePhotosResolvers = {
    Mutation: { addSpacePhotos },
};
