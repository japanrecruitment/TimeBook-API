import { IFieldResolver } from "@graphql-tools/utils";
import { S3Lib } from "@libs/index";
import { gql } from "apollo-server-core";
import { create } from "domain";
import { GqlError } from "src/functions/graphql/error";
import { Context } from "../../../context";
import { Result } from "../../core/result";
import { ImageUploadInput, ImageUploadResult } from "../../media";

type AddSpaceTypePhotoInput = {
    spaceTypeId: string;
    mime: string;
};

type AddSpaceTypePhotoArgs = { input: AddSpaceTypePhotoInput };

type AddSpaceTypePhotoResult = Promise<ImageUploadResult>;

type AddSpaceTypePhoto = IFieldResolver<any, Context, AddSpaceTypePhotoArgs, AddSpaceTypePhotoResult>;

const addSpaceTypePhoto: AddSpaceTypePhoto = async (_, { input }, { dataSources, store }) => {
    let { spaceTypeId, mime } = input;
    const type = "Cover";
    mime = mime || "image/jpeg";

    if (!spaceTypeId) throw new GqlError({ code: "BAD_USER_INPUT", message: "Invalid spaceTypeId" });

    if (!mime) throw new GqlError({ code: "BAD_USER_INPUT", message: "Invalid mime" });

    const spaceType = await store.spaceType.findFirst({ where: { id: spaceTypeId } });

    if (!spaceType) throw new GqlError({ code: "BAD_REQUEST", message: "SpaceType does not exists" });

    const updatedSpaceType = await store.spaceType.update({
        where: { id: spaceTypeId },
        data: { photo: { create: { mime, type: "Cover" } } },
        select: { photo: true },
    });

    dataSources.redis.deleteMany("space-types:*");

    const { photo } = updatedSpaceType;

    const key = `${photo.id}.${photo.mime.split("/")[1]}`;

    // get signedURL
    const S3 = new S3Lib("upload");
    const signedURL = S3.getUploadUrl(key, mime, 60 * 10);

    return { type, mime, url: signedURL, key };
};

export const addSpaceTypePhotoTypeDefs = gql`
    input AddSpaceTypePhotoInput {
        spaceTypeId: String!
        mime: String!
    }

    type Mutation {
        addSpaceTypePhoto(input: AddSpaceTypePhotoInput!): ImageUploadResult! @auth(requires: [admin])
    }
`;

export const addSpaceTypePhotoResolvers = {
    Mutation: { addSpaceTypePhoto },
};
