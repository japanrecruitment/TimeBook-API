import { IFieldResolver } from "@graphql-tools/utils";
import { gql } from "apollo-server-core";
import { Context } from "../../../../context";
import { ImageUploadInput, ImageUploadResult } from "../../../media";
import { S3Lib } from "@libs/S3";

type AddLicenseInput = {
    type: string;
    photos: ImageUploadInput[];
};

type AddLicenseArgs = { input: AddLicenseInput };

type AddLicenseResult = Promise<ImageUploadResult[]>;

type AddLicense = IFieldResolver<any, Context, AddLicenseArgs, AddLicenseResult>;

const addLicense: AddLicense = async (_, { input }, { authData, store }) => {
    const { accountId } = authData;

    const { photos, type } = input;

    const newLicense = await store.license.create({
        data: {
            approved: false,
            host: { connect: { accountId } },
            type,
            photos: {
                createMany: {
                    data: photos.map(({ mime }) => ({ type: "General", mime, postUploadInfo: {isPrivate: true} })),
                },
            },
        },
        select: { photos: { select: { id: true, mime: true, type: true } } },
    });

    const S3 = new S3Lib("upload");

    const result: ImageUploadResult[] = newLicense.photos.map(({ id, mime, type }) => {
        const key = `${id}.${mime.split("/")[1]}`;
        const url = S3.getUploadUrl(key, mime, 60 * 10);
        return { key, mime, type, url };
    });

    return result;
};

export const addLicenseTypeDefs = gql`
    input AddLicenseInput {
        type: String!
        photos: [ImageUploadInput!]!
    }

    type Mutation {
        addLicense(input: AddLicenseInput!): [ImageUploadResult] @auth(requires: [host])
    }
`;

export const addLicenseResolvers = {
    Mutation: { addLicense },
};
