import { IFieldResolver } from "@graphql-tools/utils";
import { S3Lib } from "@libs/S3";
import { Log } from "@utils/logger";
import { gql } from "apollo-server-core";
import { differenceWith } from "lodash";
import { Context } from "../../context";
import { GqlError } from "../../error";
import { ImageUploadInput, ImageUploadResult } from "../media";

type AddOptionPhotosArgs = {
    optionId: string;
    photos: ImageUploadInput[];
};

type AddOptionPhotosResult = {
    message: string;
    uploadRes?: ImageUploadResult[];
};

type AddOptionPhotos = IFieldResolver<any, Context, AddOptionPhotosArgs, Promise<AddOptionPhotosResult>>;

const addOptionPhotos: AddOptionPhotos = async (_, { optionId, photos }, { authData, store }) => {
    const { accountId } = authData || {};
    if (!accountId) throw new GqlError({ code: "FORBIDDEN", message: "無効なリクエスト" });

    const option = await store.option.findUnique({
        where: { id: optionId },
        select: { accountId: true, photos: { select: { id: true } } },
    });
    if (!option) throw new GqlError({ code: "NOT_FOUND", message: "プランが見つかりません" });

    if (accountId !== option.accountId) throw new GqlError({ code: "FORBIDDEN", message: "無効なリクエスト" });

    const updatedOption = await store.option.update({
        where: { id: optionId },
        data: {
            photos: { createMany: { data: photos.map(({ mime }) => ({ mime: mime || "image/jpeg", type: "Cover" })) } },
        },
        select: { photos: true },
    });

    const newPhotos = differenceWith(updatedOption.photos, option.photos, (a, b) => a.id === b.id);

    const S3 = new S3Lib("upload");
    const uploadRes = newPhotos
        ?.filter(({ medium, small, large }) => !medium && !small && !large)
        .map(({ id, mime, type }) => {
            const key = `${id}.${mime.split("/")[1]}`;
            const url = S3.getUploadUrl(key, mime, 60 * 10);
            return { key, mime, type, url };
        });

    Log(updatedOption, uploadRes);

    return {
        message: `写真が追加されました`,
        uploadRes,
    };
};

export const addOptionPhotosTypeDefs = gql`
    type AddOptionPhotosResult {
        message: String!
        uploadRes: [ImageUploadResult]
    }

    type Mutation {
        addOptionPhotos(optionId: ID!, photos: [ImageUploadInput!]!): AddOptionPhotosResult @auth(requires: [host])
    }
`;

export const addOptionPhotosResolvers = { Mutation: { addOptionPhotos } };
