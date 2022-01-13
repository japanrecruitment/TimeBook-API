import { S3 } from "aws-sdk";
import { omit, Log, environment } from "@utils/index";

export class S3Lib {
    private _S3 = new S3({ region: "ap-northeast-1" });
    private _BUCKET;
    private _MEDIA_UPLOAD_BUCKET = environment.MEDIA_UPLOAD_BUCKET;
    private _MEDIA_BUCKET = environment.MEDIA_BUCKET;
    private _PUBLIC_MEDIA_BUCKET = environment.PUBLIC_MEDIA_BUCKET;

    constructor(bucket: "media" | "upload") {
        this._BUCKET = bucket === "upload" ? this._MEDIA_UPLOAD_BUCKET : this._MEDIA_BUCKET;
    }

    public getUploadUrl(key: string, mime: string, ttl: number): string {
        return this._S3.getSignedUrl("putObject", {
            Bucket: this._BUCKET,
            Key: key,
            Expires: ttl,
            ContentType: mime,
        });
    }

    public getDownloadUrl(key: string, ttl: number): string {
        return this._S3.getSignedUrl("getObject", {
            Bucket: this._MEDIA_BUCKET,
            Key: key,
            Expires: ttl,
        });
    }

    public async getObject(key: string): Promise<S3.GetObjectOutput> {
        try {
            const params: S3.GetObjectRequest = {
                Bucket: this._BUCKET,
                Key: key,
            };
            const result = (await this._S3.getObject(params).promise()) as S3.GetObjectOutput;
            return result;
        } catch (error) {
            Log("Error at S3Lib.getObject", error.message);
            throw new Error(error.message);
        }
    }

    public async putObject(data: Partial<S3.PutObjectRequest>): Promise<S3.PutObjectOutput> {
        try {
            const params: S3.PutObjectRequest = {
                ...omit(data, "Bucket"),
                Bucket: this._MEDIA_BUCKET,
            };

            return (await this._S3.putObject(params).promise()) as S3.PutObjectOutput;
        } catch (error) {
            Log("Error at S3Lib.putObject", error.message);
            throw new Error(error.message);
        }
    }

    public async putPublicObject(data: Partial<S3.PutObjectRequest>): Promise<S3.PutObjectOutput> {
        try {
            const params: S3.PutObjectRequest = {
                ...omit(data, "Bucket"),
                Bucket: this._PUBLIC_MEDIA_BUCKET,
            };

            return (await this._S3.putObject(params).promise()) as S3.PutObjectOutput;
        } catch (error) {
            Log("Error at S3Lib.putPublicObject", error.message);
            throw new Error(error.message);
        }
    }

    public async deleteObject(key: string, bucket: string = "upload"): Promise<S3.DeleteObjectOutput> {
        try {
            const params: S3.DeleteObjectRequest = {
                Key: key,
                Bucket: bucket === "upload" ? this._MEDIA_UPLOAD_BUCKET : this._MEDIA_BUCKET,
            };

            return (await this._S3.deleteObject(params).promise()) as S3.DeleteObjectOutput;
        } catch (error) {
            Log("Error at S3Lib.deleteObject", error.message);
            throw new Error(error.message);
        }
    }
}
