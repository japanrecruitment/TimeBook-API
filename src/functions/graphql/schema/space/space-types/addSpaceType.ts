import { IFieldResolver } from "@graphql-tools/utils";
import { gql } from "apollo-server-core";
import { GqlError } from "src/functions/graphql/error";
import { Context } from "../../../context";
import { Result } from "../../core/result";
import { ImageUploadResult } from "../../media";
import { S3Lib } from "@libs/S3";

type AddSpaceTypeInput = {
    title: string;
    description: string;
    coverPhotoMime: string;
};

type AddSpaceTypeArgs = { input: AddSpaceTypeInput };

type AddSpaceTypeResult = Result & {
    upload: ImageUploadResult;
};

type AddSpaceType = IFieldResolver<any, Context, AddSpaceTypeArgs, Promise<AddSpaceTypeResult>>;

const addSpaceType: AddSpaceType = async (_, { input }, { dataSources, store }, info) => {
    let { title, description, coverPhotoMime } = input;
    title = title.trim();
    description = description.trim();
    coverPhotoMime = coverPhotoMime.trim() || "image/jpeg";

    if (!title) throw new GqlError({ code: "BAD_USER_INPUT", message: "Invalid title" });

    if (!description) throw new GqlError({ code: "BAD_USER_INPUT", message: "Invalid description" });

    if (!coverPhotoMime) throw new GqlError({ code: "BAD_USER_INPUT", message: "Invalid mime" });

    const spaceType = await store.spaceType.findFirst({ where: { title } });

    if (spaceType) throw new GqlError({ code: "BAD_REQUEST", message: "The title for space type is already in use" });

    const newSpaceType = await store.spaceType.create({
        data: {
            title,
            description,
            photo: { create: { mime: coverPhotoMime, type: "Cover", postUploadInfo: { cacheKey: "space-types:*" } } },
        },
        include: { photo: { select: { id: true, mime: true } } },
    });

    dataSources.redis.deleteMany("space-types:*");

    // get signedURL
    const key = `${newSpaceType.photo.id}.${newSpaceType.photo.mime.split("/")[1]}`;
    const S3 = new S3Lib("upload");
    const signedURL = S3.getUploadUrl(key, coverPhotoMime, 60 * 10);

    return {
        message: `Successfully added ${title} space type`,
        action: "upload-cover-photo",
        upload: { type: "Cover", mime: coverPhotoMime, url: signedURL, key },
    };
};

export const addSpaceTypeTypeDefs = gql`
    type AddSpaceTypeResult {
        message: String!
        action: String!
        upload: ImageUploadResult!
    }

    input AddSpaceTypeInput {
        title: String!
        description: String!
        coverPhotoMime: String!
    }

    type Mutation {
        addSpaceType(input: AddSpaceTypeInput!): AddSpaceTypeResult! @auth(requires: [admin])
    }
`;

export const addSpaceTypeResolvers = {
    Mutation: { addSpaceType },
};
