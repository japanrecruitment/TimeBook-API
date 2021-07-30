import { IFieldResolver } from "@graphql-tools/utils";
import { Address } from "@prisma/client";
import { Log } from "@utils/logger";
import { merge } from "lodash";
import { omit, pick } from "@utils/object-helper";
import { gql } from "apollo-server-core";
import { mapSelections, toPrismaSelect } from "graphql-map-selections";
import { Context } from "../../context";
import { GqlError } from "../../error";
import { Profile } from "./profile";

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

    if (id !== input.id)
        throw new GqlError({ code: "FORBIDDEN", message: "You are not allowed to modify this profile" });

    let updatedProfile;
    if (profileType === "UserProfile") {
        const userProfile = pick(input, "firstName", "firstNameKana", "lastName", "lastNameKana", "dob");
        updatedProfile = await store.user.update({
            where: { id },
            data: {
                ...userProfile,
                address: input.address
                    ? {
                          upsert: {
                              create: {
                                  ...omit(input.address, "companyId", "prefectureId"),
                                  prefecture: { connect: { id: input.address.prefectureId } },
                              },
                              update: input.address,
                          },
                      }
                    : undefined,
            },
            ...userProfileSelect,
        });
    } else if (profileType === "CompanyProfile") {
        const companyProfile = pick(input, "name", "nameKana", "registrationNumber");
        updatedProfile = await store.company.update({
            where: { id },
            data: {
                ...companyProfile,
                address: input.address
                    ? {
                          upsert: {
                              create: {
                                  ...omit(input.address, "userId", "prefectureId"),
                                  prefecture: { connect: { id: input.address.prefectureId } },
                              },
                              update: input.address,
                          },
                      }
                    : undefined,
            },
            ...companyProfileSelect,
        });
    }

    Log(updatedProfile);

    if (!updatedProfile) throw new GqlError({ code: "NOT_FOUND", message: "Profile not found" });

    return merge(updatedProfile, { email, phoneNumber });
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
        address: AddressInput
    }

    type Mutation {
        updateMyProfile(input: UpdateMyProfileInput!): Profile @auth(requires: [user, host])
    }
`;

export const updateMyProfileResolvers = {
    Mutation: { updateMyProfile },
};
