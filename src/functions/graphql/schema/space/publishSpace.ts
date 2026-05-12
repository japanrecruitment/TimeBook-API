import { IFieldResolver } from "@graphql-tools/utils";
import { environment } from "@utils/environment";
import { Log } from "@utils/logger";
import { gql } from "apollo-server-core";
import { Context } from "../../context";
import { GqlError } from "../../error";
import { Result } from "../core/result";

type PublishSpaceArgs = { id: string; publish?: boolean };

type PublishSpaceResult = Promise<Result> | Result;

type PublishSpace = IFieldResolver<any, Context, PublishSpaceArgs, PublishSpaceResult>;

const publishSpace: PublishSpace = async (_, { id, publish }, { authData, store, dataSources }) => {
    const { accountId } = authData || {};
    try {
        Log("[PUBLISH SPACE]: Fetch space ");
        const space = await store.space.findFirst({
            where: { id, isDeleted: false },
            include: {
                address: { include: { prefecture: true } },
                availableAmenities: true,
                nearestStations: true,
                pricePlans: true,
                spaceTypes: true,
                photos: true,
            },
        });

        if (!space) throw new GqlError({ code: "NOT_FOUND", message: "スペースが見つかりません" });

        if (accountId !== space.accountId) throw new GqlError({ code: "FORBIDDEN", message: "無効なリクエスト" });

        if (publish === true && space.published === true)
            throw new GqlError({ code: "BAD_REQUEST", message: "スペースはすでに公開されています" });

        // Allow unpublishing even if already unpublished to ensure Algolia sync
        // Remove the check that prevents unpublishing already unpublished spaces

        if (!space.name) throw new GqlError({ code: "BAD_REQUEST", message: "スペースのタイトルが空です" });

        if (!space.address?.id)
            throw new GqlError({ code: "BAD_REQUEST", message: "スペースの住所が指定されていません" });

        if (!space.pricePlans || space.pricePlans.length <= 0)
            throw new GqlError({ code: "BAD_REQUEST", message: "スペースには少なくとも 1 つの料金プランが必要です" });

        if (!space.spaceTypes || space.spaceTypes.length <= 0)
            throw new GqlError({
                code: "BAD_REQUEST",
                message: "スペースには少なくとも 1 つのスペース タイプが必要です",
            });

        if (!space.photos || space.photos.length <= 0)
            throw new GqlError({ code: "BAD_REQUEST", message: "スペースには少なくとも 1 枚の写真が必要です" });

        await store.space.update({ where: { id }, data: { published: publish } });
        Log({ publish, spacePublished: space.published }, "publish");
        if (publish) {
            // publish object to Algolia
            Log("Publishing space to Algolia...");
            const defaultPhoto = space.photos.filter((photo) => photo.isDefault);
            const thumbnailPhoto = defaultPhoto.length > 0 ? defaultPhoto[0] : space.photos[0];
            const publicBucketName = environment.PUBLIC_MEDIA_BUCKET;
            const awsRegion = "ap-northeast-1";
            const imageSize = "medium";
            const imageKey = `${thumbnailPhoto.id}.${thumbnailPhoto.mime.split("/")[1]}`;
            const mediumImageUrl = `https://${publicBucketName}.s3.${awsRegion}.amazonaws.com/${imageSize}/${imageKey}`;

            await dataSources.spaceAlgolia.saveObject({
                objectID: id,
                name: space.name,
                availableAmenities: space.availableAmenities?.map(({ name }) => name),
                city: space.address?.city,
                maximumCapacity: space.maximumCapacity,
                nearestStations: space.nearestStations?.map(({ stationId }) => stationId),
                numberOfSeats: space.numberOfSeats,
                prefecture: space.address?.prefecture?.name,
                price: space.pricePlans?.map(({ amount, duration, type }) => ({ amount, duration, type })),
                spaceSize: space.spaceSize,
                spaceTypes: space.spaceTypes?.map(({ title }) => title),
                subcriptionPrice: [space.subcriptionPrice],
                thumbnail: mediumImageUrl,
                _geoloc: { lat: space.address?.latitude, lng: space.address?.longitude },
            });
            Log("Space successfully published to Algolia");
            return { message: `スペースが公開されました` };
        } else {
            // unpublish object from Algolia
            Log("Unpublishing space from Algolia...");
            Log({ spaceId: id, currentPublishedStatus: space.published });

            try {
                // First, delete from Algolia
                const deleteResponse = await dataSources.spaceAlgolia.deleteObject(id);
                Log("Algolia deleteObject response:", deleteResponse);
                
                // Then update the database only if Algolia succeeded
                await store.space.update({ where: { id }, data: { published: false } });
                
                Log("Space successfully unpublished from Algolia");
                Log("NOTE: If space still appears in search, wait 1-2 minutes for Algolia replication");
            } catch (algoliaError) {
                Log("Algolia delete error:", algoliaError);

                // Check if it's a "not found" error (which is actually OK)
                if (algoliaError.message && algoliaError.message.includes("ObjectID does not exist")) {
                    Log("Object not found in Algolia - this is OK, updating DB anyway");
                    await store.space.update({ where: { id }, data: { published: false } });
                } else {
                    throw new GqlError({
                        code: "INTERNAL_ERROR",
                        message: "Algoliaでの削除に失敗しました",
                    });
                }
            }

            return { message: `スペースは非公開になりました` };
        }
    } catch (error) {
        Log("PublishSpace error:", error);
        throw error; // Re-throw the error so it's not silently swallowed
    }
};

export const publishSpaceTypeDefs = gql`
    type Mutation {
        publishSpace(id: ID!, publish: Boolean): Result! @auth(requires: [user, host])
    }
`;

export const publishSpaceResolvers = {
    Mutation: { publishSpace },
};
