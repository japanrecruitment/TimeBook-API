import { S3 } from "aws-sdk";
import { S3Event, S3EventRecord, S3Handler } from "aws-lambda";
import { middyfy } from "@middlewares/index";

import sharp from "sharp";

import { Log } from "@utils/logger";

// initialize s3 sdk
const s3ClientConfig: AWS.S3.ClientConfiguration = {};

const s3 = new S3({ region: "ap-northeast-1" });

const emailQueueWorker: S3Handler = async (event: S3Event) => {
    if (event.Records.length === 0) return;

    // retrieve all data
    const images = event.Records.map((event: S3EventRecord) => {
        return s3.getObject({ Bucket: event.s3.bucket.name, Key: event.s3.object.key }).promise();
    });

    // run concurrently
    const imageData = await Promise.all(images);

    // store all data
    const imageProcessedData = imageData.map((image) => {
        // const {} = image;
    });
    // run concurrently

    const test = await sharp({
        create: {
            width: 48,
            height: 48,
            channels: 4,
            background: { r: 255, g: 0, b: 0, alpha: 0.5 },
        },
    })
        .png()
        .toBuffer();

    console.log(test);
    // return { statusCode: 200, body: JSON.stringify({ result: true }) };
};

export const main = middyfy(emailQueueWorker, true);
