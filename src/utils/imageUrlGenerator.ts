import AWS from "aws-sdk";
import { environment } from "@utils/environment";

AWS.config.update({ region: "ap-northeast-1" });
var s3 = new AWS.S3();

export const getUrlGenerator = (key: string) => {
    return s3.getSignedUrl("getObject", {
        Bucket: environment.MEDIA_UPLOAD_BUCKET,
        Key: key, //filename
        Expires: 5 * 60, //time to expire in seconds
    });
};
