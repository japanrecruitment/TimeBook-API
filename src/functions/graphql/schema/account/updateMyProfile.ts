import { IFieldResolver } from "@graphql-tools/utils";
import { ProfileType } from "@prisma/client";
import { Log } from "@utils/logger";
import { omit } from "@utils/object-helper";
import { S3Lib } from "@libs/index";
import { merge } from "lodash";
import { gql } from "apollo-server-core";
import { GraphQLResolveInfo } from "graphql";
import { mapSelections, toPrismaSelect } from "graphql-map-selections";
import { Context } from "../../context";
import { GqlError } from "../../error";
import { Profile } from "./profile";
import { ImageUploadInput, ImageUploadResult, mapPhotoSelection } from "../media";

type UpdateProfileStrategy<T> = (input: T, context: Context, info: GraphQLResolveInfo) => Promise<Partial<Profile>>;

type UpdateProfileStrategies = { [T in ProfileType]: UpdateProfileStrategy<any> };

type UpdateUserProfileInput = {
    id: string;
    firstName?: string;
    lastName?: string;
    dob?: Date;
    firstNameKana?: string;
    lastNameKana?: string;
};

type UpdateCompanyProfileInput = {
    id: string;
    name?: string;
    nameKana?: string;
    registrationNumber?: string;
};

type UpdateMyProfileInput = UpdateUserProfileInput & UpdateCompanyProfileInput;

type UpdateMyProfile = IFieldResolver<any, Context, Record<"input", UpdateMyProfileInput>, Promise<Partial<Profile>>>;

const updateMyProfile: UpdateMyProfile = async (_, { input }, context, info) => {
    const { id, email, phoneNumber, profileType } = context.authData;

    Log(id, context.authData);
    if (id !== input.id)
        throw new GqlError({ code: "FORBIDDEN", message: "You are not allowed to modify this profile" });

    const updatedProfile = await updateProfileStrategies[profileType](input, context, info);

    if (!updatedProfile) throw new GqlError({ code: "NOT_FOUND", message: "Profile not found" });

    return { ...updatedProfile, email, phoneNumber };
};

const updateUserProfile: UpdateProfileStrategy<UpdateUserProfileInput> = async (input, { store }, info) => {
    const { profilePhoto, ...selections } = omit(mapSelections(info).UserProfile, "email", "phoneNumber", "roles");
    const select = toPrismaSelect(merge(selections, { profilePhoto: mapPhotoSelection(profilePhoto) }));
    const { id, dob, firstName, firstNameKana, lastName, lastNameKana } = input;
    return await store.user.update({
        where: { id },
        data: { dob, firstName, firstNameKana, lastName, lastNameKana },
        ...select,
    });
};

const updateCompanyProfile: UpdateProfileStrategy<UpdateCompanyProfileInput> = async (input, { store }, info) => {
    const { profilePhoto, ...selections } = omit(mapSelections(info).CompanyProfile, "email", "phoneNumber", "roles");
    const select = toPrismaSelect(merge(selections, { profilePhoto: mapPhotoSelection(profilePhoto) }));
    const { id, name, nameKana, registrationNumber } = input;
    return await store.company.update({
        where: { id },
        data: {
            name,
            nameKana,
            registrationNumber,
        },
        ...select,
    });
};

const updateProfileStrategies: UpdateProfileStrategies = {
    CompanyProfile: updateCompanyProfile,
    UserProfile: updateUserProfile,
};

type AddProfile = IFieldResolver<any, Context, Record<"input", ImageUploadInput>, Promise<ImageUploadResult>>;
const addProfilePhoto: AddProfile = async (_, { input }, { authData, store }, info) => {
    // check input
    const type = "Profile";
    const mime = input.mime || "image/jpeg";

    const { id, profileType } = authData;

    // add record in DB
    let updatedProfile;
    if (profileType === "UserProfile") {
        updatedProfile = await store.user.update({
            where: { id },
            data: { profilePhoto: { create: { mime, type } } },
            select: { profilePhoto: true },
        });
    } else {
        updatedProfile = await store.user.update({
            where: { id },
            data: { profilePhoto: { create: { mime, type } } },
            select: { profilePhoto: true },
        });
    }

    const { profilePhoto } = updatedProfile;

    const key = `${profilePhoto.id}.${profilePhoto.mime.split("/")[1]}`;

    // get signedURL
    const S3 = new S3Lib("upload");
    const signedURL = S3.getUploadUrl(key, mime, 60 * 10);

    return { type, mime, url: signedURL, key };
};

export const updateMyProfileTypeDefs = gql`
    input UpdateMyProfileInput {
        id: ID!
        firstName: String
        lastName: String
        dob: Date
        firstNameKana: String
        lastNameKana: String
        name: String
        nameKana: String
        registrationNumber: String
    }

    type Mutation {
        updateMyProfile(input: UpdateMyProfileInput!): Profile @auth(requires: [user, host])
        addProfilePhoto(input: ImageUploadInput!): ImageUploadResult
    }
`;

export const updateMyProfileResolvers = {
    Mutation: { updateMyProfile, addProfilePhoto },
};
