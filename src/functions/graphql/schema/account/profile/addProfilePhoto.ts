import { IFieldResolver } from "@graphql-tools/utils";
import { S3Lib } from "@libs/index";
import { gql } from "apollo-server-core";
import { GqlError } from "../../../error";
import { Context } from "../../../context";
import { ImageUploadInput, ImageUploadResult } from "../../media";

type AddProfilePhotoArgs = { input: ImageUploadInput; uploadInHost: boolean };

type AddProfilePhotoResult = Promise<ImageUploadResult>;

type AddProfilePhoto = IFieldResolver<any, Context, AddProfilePhotoArgs, AddProfilePhotoResult>;

const addProfilePhoto: AddProfilePhoto = async (_, { input, uploadInHost }, { authData, store }, info) => {
    const { accountId, id, profileType, roles } = authData || {};
    if (!accountId || !id) throw new GqlError({ code: "FORBIDDEN", message: "無効なリクエスト" });

    // check input
    const type = "Profile";
    const mime = input.mime || "image/jpeg";

    // add record in DB
    let updatedProfile;
    if (uploadInHost) {
        if (!roles.includes("host")) throw new GqlError({ code: "FORBIDDEN", message: "無許可。" });
        updatedProfile = await store.host.update({
            where: { accountId },
            data: { profilePhoto: { create: { mime, type } } },
            select: { profilePhoto: true },
        });
    } else {
        if (profileType === "UserProfile") {
            updatedProfile = await store.user.update({
                where: { id },
                data: { profilePhoto: { create: { mime, type } } },
                select: { profilePhoto: true },
            });
        } else {
            updatedProfile = await store.company.update({
                where: { id },
                data: { profilePhoto: { create: { mime, type } } },
                select: { profilePhoto: true },
            });
        }
    }

    if (!updatedProfile) throw new GqlError({ code: "FORBIDDEN", message: "アカウントが見つかりませんでした。" });

    const { profilePhoto } = updatedProfile;

    const key = `${profilePhoto.id}.${profilePhoto.mime.split("/")[1]}`;

    // get signedURL
    const S3 = new S3Lib("upload");
    const signedURL = S3.getUploadUrl(key, mime, 60 * 10);

    return { type, mime, url: signedURL, key };
};

export const addProfilePhotoTypeDefs = gql`
    type Mutation {
        addProfilePhoto(input: ImageUploadInput!, uploadInHost: Boolean): ImageUploadResult
            @auth(requires: [user, host])
    }
`;

export const addProfilePhotoResolvers = {
    Mutation: { addProfilePhoto },
};
