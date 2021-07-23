import { IFieldResolver } from "@graphql-tools/utils";
import { Address } from "@prisma/client";
import { Log } from "@utils/logger";
import { omit, pick } from "@utils/object-helper";
import { gql } from "apollo-server-core";
import { mapSelections } from "graphql-map-selections";
import { Context } from "../../context";
import { GqlError } from "../../error";
import { Profile } from "./profile";

type UpdateMyProfileInput = {
    id: string;
    firstName?: string;
    lastName?: string;
    firstNameKana?: string;
    lastNameKana?: string;
    name?: string;
    nameKana?: string;
    registrationNumber?: string;
    address?: Partial<Address>;
};

type UpdateMyProfile = IFieldResolver<any, Context, Record<"input", UpdateMyProfileInput>, Promise<Profile>>;

const updateMyProfile: UpdateMyProfile = async (_, { input }, { authData, store }, info) => {
    const { UserProfile, CompanyProfile } = mapSelections(info);
    const { id, profileType } = authData;

    if (id !== input.id)
        throw new GqlError({ code: "FORBIDDEN", message: "You are not allowed to modify this profile" });

    let updatedProfile;
    if (profileType === "UserProfile") {
        const userProfile = pick(input, "firstName", "firstNameKana", "lastName", "lastNameKana");
        const address = input.address;
        updatedProfile = await store.user.update({
            where: { id },
            data: {
                ...userProfile,
                address: address ? { upsert: { create: omit(address, "id"), update: address } } : undefined,
            },
            select: omit(UserProfile, "email", "phoneNumber"),
        });
    } else if (profileType === "CompanyProfile") {
        const companyProfile = pick(input, "name", "nameKana", "registrationNumber");
        const address = input.address;
        updatedProfile = await store.company.update({
            where: { id },
            data: {
                ...companyProfile,
                address: address ? { upsert: { create: omit(address, "id"), update: address } } : undefined,
            },
            select: omit(CompanyProfile, "email", "phoneNumber"),
        });
    }

    Log(updatedProfile);

    if (!updatedProfile) throw new GqlError({ code: "NOT_FOUND", message: "Profile not found" });

    return updatedProfile;
};

export const updateMyProfileTypeDefs = gql`
    input UpdateMyProfileInput {
        id: ID!
        firstName: String
        lastName: String
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
