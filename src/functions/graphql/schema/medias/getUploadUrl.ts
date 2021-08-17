import AWS from "aws-sdk";
import { IFieldResolver } from "@graphql-tools/utils";
import { gql } from "apollo-server-core";
import { Context } from "../../context";
import { environment } from "@utils/environment";
import { v4 as uuidv4 } from "uuid";

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
    AWS.config.update({ credentials: credentials, region: "ap-northeast-1" });
    var s3 = new AWS.S3();
    const original = uuidv4();
    //insert into photogallery table and return that id in the response
    //const photo = await store.photoGallery.create({ data: { original } });
    const presignedPUTURL = await s3.getSignedUrlPromise("putObject", {
        Bucket: environment.BUCKET_URL,
        Key: `${original}.jpg`, //filename
        Expires: 200, //time to expire in seconds
        Body: "image/jpeg",
    });
    return { presignedPUTURL, photoGalleryId: "231" };
};

export const getUploadTokenTypeDefs = gql`
    type UploadTokenResult {
        presignedPUTURL: String!
        photoGalleryId: String!
    }

    type Query {
        getUploadToken: UploadTokenResult!
    }
`;

export const getUploadTokenResolver = { Query: { getUploadToken } };
