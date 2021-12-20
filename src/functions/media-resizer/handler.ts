import { S3Event, S3EventRecord, S3Handler } from "aws-lambda";
import { middyfy } from "@middlewares/index";
import { Log, ImageProcessor, store, RedisClient } from "@utils/index";
import { S3Lib } from "@libs/index";

const resizeMediaQueueWorker: S3Handler = async (event: S3Event) => {
    if (event.Records.length === 0) return;

    // get information about the image from DB

    // retrieve all data
    const images = event.Records.map((event: S3EventRecord) => {
        // TODO: need to fetch type from DB
        return readAndResize(event.s3.object.key);
    });

    // run concurrently
    await Promise.all(images);
};

const readAndResize = async (key: string) => {
    const S3 = new S3Lib("upload");

    // get key information from DB
    const photoId = key.split(".")[0];
    // get image ID
    const { id, mime, type, postUploadInfo } = await store.photo.findUnique({
        where: { id: photoId },
        select: { id: true, mime: true, type: true, postUploadInfo: true },
    });

    Log(id, mime, type, postUploadInfo);

    const { cacheKey } =
        postUploadInfo && typeof postUploadInfo === "object" ? (postUploadInfo as any) : { cacheKey: undefined };
    const { isPrivate } =
        postUploadInfo && typeof postUploadInfo === "object" ? (postUploadInfo as any) : { isPrivate: false };

    if (cacheKey) {
        const cache = RedisClient.createInstance();
        cache.deleteMany(cacheKey);
    }

    const uploadedImage = await S3.getObject(key);

    const imageProcessor = new ImageProcessor();
    await imageProcessor.init(uploadedImage.Body as Buffer);

    const processedImages = await imageProcessor.resize({ type });

    // put resized images to media bucket
    await Promise.all(
        processedImages.map(({ size, image }) =>
            S3.putObject({ Key: `${type}/${size}/${key}`, Body: image, ContentType: uploadedImage.ContentType })
        )
    );

    // add small and thumbnail to public bucket
    // check if image is private
    if (!isPrivate) {
        await Promise.all(
            processedImages.map(({ size, image }) => {
                if (size === "small" || size === "thumbnail") {
                    S3.putPublicObject({ Key: `${size}/${key}`, Body: image, ContentType: uploadedImage.ContentType });
                }
            })
        );
    }

    // Delete original from
    await S3.deleteObject(key);

    const imageUpdateData = {};
    processedImages.map(({ size, width, height }) => {
        imageUpdateData[size] = { width, height, url: `${type}/${size}/${key}` };
    });

    Log(processedImages);

    await store.photo.update({ where: { id }, data: imageUpdateData });

    return key;
};

export const main = middyfy(resizeMediaQueueWorker, true);
