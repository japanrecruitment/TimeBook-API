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

        if (!space) throw new GqlError({ code: "NOT_FOUND", message: "Space not found" });

        if (accountId !== space.accountId)
            throw new GqlError({ code: "FORBIDDEN", message: "You are not allowed to modify this space" });

        if (publish === true && space.published === true)
            throw new GqlError({ code: "BAD_REQUEST", message: "Space already published" });

        if (publish === false && space.published === false)
            throw new GqlError({ code: "BAD_REQUEST", message: "Space already unpublished" });

        if (!space.name) throw new GqlError({ code: "BAD_REQUEST", message: "Found empty space name" });

        if (!space.address?.id) throw new GqlError({ code: "BAD_REQUEST", message: "Space address not provided yet" });

        if (!space.pricePlans || space.pricePlans.length <= 0)
            throw new GqlError({ code: "BAD_REQUEST", message: "A space must have atleast one price plan" });

        if (!space.spaceTypes || space.spaceTypes.length <= 0)
            throw new GqlError({ code: "BAD_REQUEST", message: "A space must have atleast one space type" });

        if (!space.photos || space.photos.length <= 0)
            throw new GqlError({ code: "BAD_REQUEST", message: "A space must have atleast one photo" });

        await store.space.update({ where: { id }, data: { published: publish } });

        if (publish) {
            // publish object to Algolia
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
            return { message: `Successfully published space` };
        } else {
            // unpublish object from Algolia
            await dataSources.spaceAlgolia.deleteObject(id);
            return { message: `Successfully unpublished space` };
        }
    } catch (error) {
        Log(error);
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
