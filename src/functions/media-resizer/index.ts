export default {
    handler: `${__dirname.split(process.cwd())[1].substring(1)}/handler.main`,
    events: [
        {
            s3: { bucket: { Ref: "MediaUploadBucket" }, event: "s3:ObjectCreated:*", existing: true },
        },
    ],
};
