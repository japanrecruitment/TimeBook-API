import { S3Handler } from "aws-lambda";
import { middyfy } from "@middlewares/index";

import sharp from "sharp";

import { Log } from "@utils/logger";

const emailQueueWorker: S3Handler = async (event) => {
    if (event.Records.length === 0) return;

    console.log(event);

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
