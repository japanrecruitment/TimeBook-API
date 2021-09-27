import { gql } from "apollo-server-core";
import { IFieldResolver } from "@graphql-tools/utils";
import { Context } from "../../../context";
import { S3Lib } from "@libs/index";
import { ImageUploadInput, ImageUploadResult } from "../../media";

type AddPhotoId = IFieldResolver<any, Context, Record<"input", ImageUploadInput>, Promise<ImageUploadResult>>;

const addPhotoId: AddPhotoId = async (_, { input }, { authData, store }, info) => {
    // check input
    const type = "General";
    const mime = input.mime || "image/jpeg";

    const { accountId } = authData;

    // add record in DB
    let updatedProfile = await store.host.update({
        where: { accountId },
        data: { photoId: { create: { mime, type } } },
        select: { photoId: true },
    });

    const { photoId } = updatedProfile;

    const key = `${photoId.id}.${photoId.mime.split("/")[1]}`;

    // get signedURL
    const S3 = new S3Lib("upload");
    const signedURL = S3.getUploadUrl(key, mime, 60 * 10);

    return { type, mime, url: signedURL, key };
};

export const registerHostTypeDefs = gql`
    type Mutation {
        addPhotoId(input: ImageUploadInput!): ImageUploadResult @auth(requires: [host])
    }
`;

export const registerHostResolvers = {
    Mutation: { addPhotoId },
};
