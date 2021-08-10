import AWS from "aws-sdk";
import { environment } from "@utils/environment";

export const getUrlGenerator = (original: string) => {
    var credentials = {
        accessKeyId: environment.S3_ACCESS_KEY,
        secretAccessKey: environment.S3_SECRET_KEY,
    };
    AWS.config.update({ credentials: credentials, region: "eu-west-2" });
    var s3 = new AWS.S3();
    return s3.getSignedUrl("getObject", {
        Bucket: environment.BUCKET_URL,
        Key: original, //filename
        Expires: 100, //time to expire in seconds
    });
};
