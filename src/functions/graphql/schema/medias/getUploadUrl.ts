import AWS from "aws-sdk";
import { IFieldResolver } from "@graphql-tools/utils";
import { gql } from "apollo-server-core";
import { Context } from "../../context";
import { randomUUID } from "crypto";
import { environment } from "@utils/environment";
type UploadTokenResult = {
    presignedPUTURL: string;
    photoGalleryId: string;
};

type GetUploadToken = IFieldResolver<any, Context, Record<string, any>, Promise<UploadTokenResult>>;
const getUploadToken: GetUploadToken = async (_, __, { authData, store }) => {
    var credentials = {
        accessKeyId: environment.S3_ACCESS_KEY,
        secretAccessKey: environment.S3_SECRET_KEY,
    };
    AWS.config.update({ credentials: credentials, region: "eu-west-2" });
    var s3 = new AWS.S3();

    //insert into photogallery table and return that id in the response
    const original = randomUUID();
    const photo = await store.photoGallery.create({ data: { original } });
    const presignedPUTURL = s3.getSignedUrl("putObject", {
        Bucket: environment.BUCKET_URL,
        Key: `spaceType/${original}.jpg`, //filename
        Expires: 100, //time to expire in seconds
    });
    return { presignedPUTURL, photoGalleryId: photo.id };
};

export const allSpaceTypesTypeDefs = gql`
    type UploadTokenResult {
        presignedPUTURL: String!
        photoGalleryId: String!
    }

    type Query {
        getUploadToken: UploadTokenResult! @auth(requires: [admin])
    }
`;

export const getUploadTokenResolver = { Query: { getUploadToken } };
