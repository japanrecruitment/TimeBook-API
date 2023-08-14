import { middyfy } from "@middlewares/index";
import { environment } from "@utils/environment";
import { Log } from "@utils/logger";
import { spaceIndex } from "@utils/algolia";
import { store } from "@utils/store";
import { RedisClient } from "@utils/redis";
import { formatJSONResponse, ValidatedEventAPIGatewayProxyEvent } from "@libs/apiGateway";
import getSchema from "./get-schema";
import postSchema from "./post-schema";

type ProcessedImage = { size: string; width: number; height: number };

const photoObject: ValidatedEventAPIGatewayProxyEvent<typeof getSchema & typeof postSchema> = async (event) => {
    const method = event.requestContext.httpMethod;
    const isGet = method === "GET" || method === "get" || method === "Get";

    const photoId = isGet ? event.queryStringParameters?.photoId : event.body?.photoId;

    Log(photoId);

    if (!photoId) return formatJSONResponse(400, { message: "無効なID" });

    const photo = await store.photo.findUnique({
        where: { id: photoId },
        select: { id: true, mime: true, type: true, postUploadInfo: true, spaceId: true },
    });

    Log(photo);

    if (!photo) return formatJSONResponse(400, { message: "無効なID" });

    const { id, mime, type, postUploadInfo, spaceId } = photo;

    if (isGet) return formatJSONResponse(200, photo);

    const processedImages: ProcessedImage[] = event.body?.processedImages as ProcessedImage[];

    if (!processedImages) return formatJSONResponse(400, { message: "無効な処理済み画像" });
    for (let image of processedImages) {
        if (!image.height || !image.width || !image.size)
            return formatJSONResponse(400, { message: "無効な処理済み画像" });
    }

    const { cacheKey } =
        postUploadInfo && typeof postUploadInfo === "object" ? (postUploadInfo as any) : { cacheKey: undefined };
    const { isPrivate } =
        postUploadInfo && typeof postUploadInfo === "object" ? (postUploadInfo as any) : { isPrivate: false };

    if (cacheKey) {
        const cache = RedisClient.createInstance();
        cache.deleteMany(cacheKey);
    }

    Log(isPrivate);

    // if image is public and is a space image add it to algolia
    if (!isPrivate) {
        if (spaceId) {
            const publicBucketName = environment.PUBLIC_MEDIA_BUCKET;
            const awsRegion = "ap-northeast-1";
            const imageSize = "medium";
            const imageKey = `${id}.${mime.split("/")[1]}`;
            const mediumImage = processedImages.find(({ size }) => size === imageSize);
            const mediumImageUrl = `https://${publicBucketName}.s3.${awsRegion}.amazonaws.com/${imageSize}/${imageKey}`;
            if (mediumImage) await spaceIndex.partialUpdateObject({ objectID: spaceId, thumbnail: mediumImageUrl });
        }
    }

    const imageUpdateData = {};
    processedImages.map(({ size, width, height }) => {
        imageUpdateData[size] = { width, height, url: `${type}/${size}/${id}.${mime.split("/")[1]}` };
    });

    await store.photo.update({ where: { id }, data: imageUpdateData });

    return formatJSONResponse(200, { message: "写真を更新しました", updated: true });
};

export const main = middyfy(photoObject, true);
