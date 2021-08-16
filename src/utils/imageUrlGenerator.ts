import AWS from "aws-sdk";
import { environment } from "@utils/environment";

AWS.config.update({ region: "ap-northeast-1" });
var s3 = new AWS.S3();

export const getUrlGenerator = (original: string) => {
    return s3.getSignedUrl("getObject", {
        Bucket: environment.BUCKET_URL,
        Key: original, //filename
        Expires: 100, //time to expire in seconds
    });
};
