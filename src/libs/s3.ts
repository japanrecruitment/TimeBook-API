import { S3 } from "aws-sdk";
import { environment } from "@utils/environment";

interface IS3Util {
    getUploadUrl: (key: string, mime: string, ttl: number) => string;
    getDownloadUrl: (key: string, ttl: number) => string;
}

export enum BucketType {
    MediaUpload = "MediaUpload",
    MediaRead = "MediaRead",
}

export class S3Lib implements IS3Util {
    private S3_CLIENT = new S3({ region: "ap-northeast-1" });
    private UPLOAD_BUCKET: string = environment.MEDIA_UPLOAD_BUCKET;
    private READ_BUCKET: string = environment.MEDIA_BUCKET;

    public getUploadUrl(key: string, mime: string, ttl: number) {
        return this.S3_CLIENT.getSignedUrl("putObject", {
            Bucket: this.UPLOAD_BUCKET,
            Key: key,
            Expires: ttl,
            ContentType: mime,
        });
    }

    public getDownloadUrl(key: string, ttl: number, bucket?: BucketType) {
        return this.S3_CLIENT.getSignedUrl("getObject", {
            Bucket: bucket && bucket === BucketType.MediaUpload ? this.UPLOAD_BUCKET : this.READ_BUCKET,
            Key: key,
            Expires: ttl,
        });
    }
}
