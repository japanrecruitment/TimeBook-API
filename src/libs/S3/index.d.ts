declare module "S3Lib" {
    export class S3Lib {
        constructor(bucket: "media" | "upload");
        getUploadUrl: (key: string, mime: string, ttl: number) => string;
        getDownloadUrl: (key: string, ttl: number) => string;
    }
}
