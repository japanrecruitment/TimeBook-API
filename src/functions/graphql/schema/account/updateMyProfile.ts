import { IFieldResolver } from "@graphql-tools/utils";
import { Address } from "@prisma/client";
import { Log, omit, pick } from "@utils/index";
import { S3Lib } from "@libs/index";

import { merge } from "lodash";
import { gql } from "apollo-server-core";
import { mapSelections, toPrismaSelect } from "graphql-map-selections";
import { Context } from "../../context";
import { GqlError } from "../../error";
import { Profile } from "./profile";
import { ImageTypes } from "../media";

type UpdateUserProfileInput = {
    id: string;
    firstName?: string;
    lastName?: string;
    dob?: Date;
    firstNameKana?: string;
    lastNameKana?: string;
    address?: Partial<Address>;
};

type UpdateCompanyProfileInput = {
    id: string;
    name?: string;
    nameKana?: string;
    registrationNumber?: string;
    address?: Partial<Address>;
};

type UpdateMyProfileInput = UpdateUserProfileInput & UpdateCompanyProfileInput;

type UpdateMyProfile = IFieldResolver<any, Context, Record<"input", UpdateMyProfileInput>, Promise<Profile>>;

const updateMyProfile: UpdateMyProfile = async (_, { input }, { authData, store }, info) => {
    const { UserProfile, CompanyProfile } = mapSelections(info);
    const { id, email, phoneNumber, profileType } = authData;

    const userProfileSelect =
        profileType === "UserProfile" ? toPrismaSelect(omit(UserProfile, "email", "phoneNumber")) : false;
    const companyProfileSelect =
        profileType === "CompanyProfile" ? toPrismaSelect(omit(CompanyProfile, "email", "phoneNumber")) : false;

    let updatedProfile;
    if (profileType === "UserProfile") {
        const userProfile = pick(input, "firstName", "firstNameKana", "lastName", "lastNameKana", "dob");

        const updatedData = { ...userProfile };
        if (input.address) {
            updatedData["address"] = {
                upsert: {
                    create: {
                        ...omit(input.address, "companyId", "prefectureId"),
                        prefecture: { connect: { id: input.address.prefectureId } },
                    },
                    update: input.address,
                },
            };
        }

        updatedProfile = await store.user.update({
            where: { id },
            data: updatedData,
            ...userProfileSelect,
        });
    } else if (profileType === "CompanyProfile") {
        const companyProfile = pick(input, "name", "nameKana", "registrationNumber");

        const updatedData = { ...companyProfile };
        if (input.address) {
            updatedData["address"] = {
                upsert: {
                    create: {
                        ...omit(input.address, "companyId", "prefectureId"),
                        prefecture: { connect: { id: input.address.prefectureId } },
                    },
                    update: input.address,
                },
            };
        }

        updatedProfile = await store.company.update({
            where: { id },
            data: updatedData,
            ...companyProfileSelect,
        });
    }

    if (!updatedProfile) throw new GqlError({ code: "NOT_FOUND", message: "Profile not found" });

    return merge(updatedProfile, { email, phoneNumber });
};

type ImageUploadInput = {
    mime: string;
};

type ImageUploadResult = {
    type: ImageTypes;
    url: string;
    mime: string;
    key: string;
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
            data: {
                profilePhoto: {
                    create: {
                        mime,
                        type,
                    },
                },
            },
            select: {
                profilePhoto: true,
            },
        });
    } else {
        updatedProfile = await store.user.update({
            where: { id },
            data: {
                profilePhoto: {
                    create: {
                        mime,
                        type,
                    },
                },
            },
            select: {
                profilePhoto: true,
            },
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
        firstName: String
        lastName: String
        dob: Date
        firstNameKana: String
        lastNameKana: String
        name: String
        nameKana: String
        registrationNumber: String
        address: AddressInput
    }

    type Mutation {
        updateMyProfile(input: UpdateMyProfileInput!): Profile @auth(requires: [user, host])
        addProfilePhoto(input: ImageUploadInput!): ImageUploadResult
    }
`;

export const updateMyProfileResolvers = {
    Mutation: { updateMyProfile, addProfilePhoto },
};
