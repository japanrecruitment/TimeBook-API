import { IFieldResolver } from "@graphql-tools/utils";
import { Address, ProfileType } from "@prisma/client";
import { Log } from "@utils/logger";
import { omit } from "@utils/object-helper";
import { gql } from "apollo-server-core";
import { GraphQLResolveInfo } from "graphql";
import { mapSelections, toPrismaSelect } from "graphql-map-selections";
import { Context } from "../../context";
import { GqlError } from "../../error";
import { Profile } from "./profile";

type UpdateProfileStrategy<T> = (input: T, context: Context, info: GraphQLResolveInfo) => Promise<Partial<Profile>>;

type UpdateProfileStrategies = { [T in ProfileType]: UpdateProfileStrategy<any> };

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

type UpdateMyProfile = IFieldResolver<any, Context, Record<"input", UpdateMyProfileInput>, Promise<Partial<Profile>>>;

const updateMyProfile: UpdateMyProfile = async (_, { input }, context, info) => {
    const { id, email, phoneNumber, profileType } = context.authData;

    if (id !== input.id)
        throw new GqlError({ code: "FORBIDDEN", message: "You are not allowed to modify this profile" });

    const updatedProfile = await updateProfileStrategies[profileType](input, context, info);

    Log(updatedProfile);

    if (!updatedProfile) throw new GqlError({ code: "NOT_FOUND", message: "Profile not found" });

    return { ...updatedProfile, email, phoneNumber };
};

const updateUserProfile: UpdateProfileStrategy<UpdateUserProfileInput> = async (input, { store }, info) => {
    const select = toPrismaSelect(omit(mapSelections(info).UserProfile, "email", "phoneNumber"));
    const { id, address, dob, firstName, firstNameKana, lastName, lastNameKana } = input;
    return await store.user.update({
        where: { id },
        data: {
            dob,
            firstName,
            firstNameKana,
            lastName,
            lastNameKana,
            address: address
                ? {
                      upsert: {
                          create: {
                              ...omit(address, "companyId", "prefectureId", "spaceId"),
                              prefecture: { connect: { id: input.address.prefectureId } },
                          },
                          update: address,
                      },
                  }
                : undefined,
        },
        ...select,
    });
};

const updateCompanyProfile: UpdateProfileStrategy<UpdateCompanyProfileInput> = async (input, { store }, info) => {
    const select = toPrismaSelect(omit(mapSelections(info).CompanyProfile, "email", "phoneNumber"));
    const { id, address, name, nameKana, registrationNumber } = input;
    return await store.company.update({
        where: { id },
        data: {
            name,
            nameKana,
            registrationNumber,
            address: address
                ? {
                      upsert: {
                          create: {
                              ...omit(address, "userId", "prefectureId", "spaceId"),
                              prefecture: { connect: { id: input.address.prefectureId } },
                          },
                          update: address,
                      },
                  }
                : undefined,
        },
        ...select,
    });
};

const updateProfileStrategies: UpdateProfileStrategies = {
    CompanyProfile: updateCompanyProfile,
    UserProfile: updateUserProfile,
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
