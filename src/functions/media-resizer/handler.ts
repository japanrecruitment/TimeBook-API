import { S3 } from "aws-sdk";
import { S3Event, S3EventRecord, S3Handler } from "aws-lambda";
import { middyfy } from "@middlewares/index";

import sharp from "sharp";

import { Log, ImageProcessor, ImageTypes } from "@utils/index";
import { S3Lib } from "@libs/index";

const s3 = new S3({ region: "ap-northeast-1" });

const emailQueueWorker: S3Handler = async (event: S3Event) => {
    if (event.Records.length === 0) return;

    // retrieve all data
    const images = event.Records.map((event: S3EventRecord) => {
        // TODO: need to fetch type from DB
        return readAndResize(event.s3.object.key, "general");
    });

    // run concurrently
    await Promise.all(images);
};

const readAndResize = async (key: string, type: ImageTypes = "general") => {
    const S3 = new S3Lib("upload");

    const uploadedImage = await S3.getObject(key);

    const imageProcessor = new ImageProcessor();
    await imageProcessor.init(uploadedImage.Body as Buffer);

    const processedImages = await imageProcessor.resize({ type });

    // put resized images to media bucket
    await Promise.all(
        processedImages.map(({ size, image }) =>
            S3.putObject({ Key: `${type}/${size}/${key}`, Body: image, ContentType: uploadedImage.ContentType })
        )
    );

    // Delete original from
    await S3.deleteObject(key);

    return key;
};

export const main = middyfy(emailQueueWorker, true);
