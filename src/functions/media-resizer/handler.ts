import { S3Handler } from "aws-lambda";
import { middyfy } from "@middlewares/index";

import { Log } from "@utils/logger";

const emailQueueWorker: S3Handler = async (event) => {
    if (event.Records.length === 0) return;

    console.log(event);

    // return { statusCode: 200, body: JSON.stringify({ result: true }) };
};

export const main = middyfy(emailQueueWorker, true);
