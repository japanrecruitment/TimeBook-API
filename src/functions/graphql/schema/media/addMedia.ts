import { IFieldResolver } from "@graphql-tools/utils";
import { gql } from "apollo-server-core";
import { Context } from "../../context";
import { GqlError } from "../../error";

import { BucketType, S3Lib } from "@libs/index";
import { Log } from "@utils/logger";

enum ImageType {
    profile = "profile",
    general = "general",
    space = "space",
    photoId = "photoId",
}
type ImageUploadInput = {
    type: ImageType;
    mime: string;
};

type ImageUploadResult = {
    type: ImageType;
    url: string;
};

type UploadImageArgs = { input: ImageUploadInput };

type UploadImage = IFieldResolver<any, Context, UploadImageArgs, Promise<ImageUploadResult>>;

const uploadImage: UploadImage = async (_, { input }, { store }, info) => {
    Log(input);
    // check input
    const type = input.type ? ImageType[input.type] : ImageType.general;
    const mime = input.mime || "image/jpeg";
    // add record in DB
    const mediaId = `1234${Date.now()}.jpeg`;
    // get signedURL
    const S3 = new S3Lib();
    const signedURL = S3.getUploadUrl(mediaId, mime, 60 * 10);

    return { type, mime, url: signedURL };
};

const readImage = async (_, { key }, { store }, info) => {
    // get signedURL
    const S3 = new S3Lib();
    const signedURL = S3.getDownloadUrl(key, 10, BucketType.MediaUpload);

    return { url: signedURL };
};

export const uploadImageTypeDefs = gql`
    enum ImageType {
        profile
        general
        space
        photoId
    }
    input ImageUploadInput {
        type: ImageType
        mime: String
    }

    type ImageUploadResult {
        type: ImageType!
        url: String!
        mime: String!
    }

    type test {
        url: String!
    }

    type Query {
        readImage(key: String): test
    }

    type Mutation {
        uploadImage(input: ImageUploadInput!): ImageUploadResult!
    }
`;

export const uploadImageResolvers = {
    Query: { readImage },
    Mutation: { uploadImage },
};
