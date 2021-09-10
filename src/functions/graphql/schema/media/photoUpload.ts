import { IFieldResolver } from "@graphql-tools/utils";
import { gql } from "apollo-server-core";
import { Context } from "../../context";
import { GqlError } from "../../error";

import { S3Lib } from "@libs/index";
import { Log } from "@utils/logger";
import { ImageProcessor } from "@utils/image-processor";

type ImageType = "profile" | "cover" | "general";
type ImageUploadInput = {
    mime: string;
    type?: ImageType;
};

type ImageUploadResult = {
    type: ImageType;
    url: string;
};

type UploadImageArgs = { input: ImageUploadInput };

type UploadImage = IFieldResolver<any, Context, UploadImageArgs, Promise<ImageUploadResult>>;

const uploadImage: UploadImage = async (_, { input }, { store }, info) => {
    // check input
    const type = input.type ? input.type : "general";
    const mime = input.mime || "image/jpeg";

    // add record in DB
    const mediaId = `1234${Date.now()}.jpeg`;
    // get signedURL
    const S3 = new S3Lib("upload");
    const signedURL = S3.getUploadUrl(mediaId, mime, 60 * 10);

    return { type, mime, url: signedURL };
};

const readImage = async (_, { key }, { store }, info) => {
    // get signedURL
    const S3 = new S3Lib("media");
    const signedURL = S3.getDownloadUrl(key, 60);

    return { url: signedURL };
};

const readAndResizeImage = async (_, { key }) => {
    const S3 = new S3Lib("upload");

    const uploadedImage = await S3.getObject(key);

    const imageProcessor = new ImageProcessor();
    await imageProcessor.init(uploadedImage.Body as Buffer);

    const processedImages = await imageProcessor.resize({ type: "general" });

    // put resized images to media bucket
    await Promise.all(
        processedImages.map(({ size, image }) =>
            S3.putObject({ Key: `${size}/${key}`, Body: image, ContentType: uploadedImage.ContentType })
        )
    );

    // Delete original from
    await S3.deleteObject(key);

    return key;
};

export const MediaTypeDefs = gql`
    enum ImageType {
        profile
        cover
        general
    }
    input ImageUploadInput {
        mime: String
        type: ImageType?
    }

    type ImageUploadResult {
        type: ImageType!
        url: String!
        mime: String!
        key: String!
    }
    
    
`;

export const MediaResolvers = {};

// type Media {

//     }

//     type Photo {

//     }
