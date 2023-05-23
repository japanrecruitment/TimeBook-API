import { IFieldResolver } from "@graphql-tools/utils";
import { S3Lib } from "@libs/S3";
import { gql } from "apollo-server-core";
import { Context } from "../../context";
import { GqlError } from "../../error";
import { Result } from "../core/result";
import { environment } from "@utils/environment";

type changeDefaultSpacePhotoArgs = { photoId: string; spaceId: string };

type changeDefaultSpacePhotoResult = Result;

type ChangeDefaultSpacePhoto = IFieldResolver<
    any,
    Context,
    changeDefaultSpacePhotoArgs,
    Promise<changeDefaultSpacePhotoResult>
>;

const changeDefaultSpacePhoto: ChangeDefaultSpacePhoto = async (
    _,
    { photoId, spaceId },
    { authData, store, dataSources }
) => {
    const { accountId } = authData || {};
    if (!accountId) throw new GqlError({ code: "FORBIDDEN", message: "Invalid token!!" });

    const photo = await store.photo.findUnique({
        where: { id: photoId },
        include: { space: { select: { accountId: true } } },
    });
    if (!photo || !photo.space) throw new GqlError({ code: "NOT_FOUND", message: "Photo not found" });

    if (accountId !== photo.space?.accountId)
        throw new GqlError({ code: "FORBIDDEN", message: "You are not allowed to remove this space photo" });

    const [__, defaultPhoto] = await store.$transaction([
        store.photo.updateMany({
            where: {
                spaceId,
            },
            data: {
                isDefault: false,
            },
        }),
        store.photo.update({
            where: { id: photoId },
            data: {
                isDefault: true,
            },
        }),
    ]);

    const thumbnailPhoto = defaultPhoto;
    const publicBucketName = environment.PUBLIC_MEDIA_BUCKET;
    const awsRegion = "ap-northeast-1";
    const imageSize = "medium";
    const imageKey = `${thumbnailPhoto.id}.${thumbnailPhoto.mime.split("/")[1]}`;
    const mediumImageUrl = `https://${publicBucketName}.s3.${awsRegion}.amazonaws.com/${imageSize}/${imageKey}`;

    await dataSources.spaceAlgolia.partialUpdateObject({
        objectID: spaceId,
        thumbnail: mediumImageUrl,
    });

    return { message: `Successfully removed space photo` };
};

export const changeDefaultSpacePhotoTypeDefs = gql`
    type Mutation {
        changeDefaultSpacePhoto(photoId: ID!, spaceId: ID!): Result @auth(requires: [host])
    }
`;

export const changeDefaultSpacePhotoResolvers = { Mutation: { changeDefaultSpacePhoto: changeDefaultSpacePhoto } };
