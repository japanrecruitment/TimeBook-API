import { IFieldResolver } from "@graphql-tools/utils";
import { ProfileType } from "@prisma/client";
import { Log } from "@utils/logger";
import { gql } from "apollo-server-core";
import { GraphQLResolveInfo } from "graphql";
import { mapSelections } from "graphql-map-selections";
import { Context } from "../../../context";
import { GqlError } from "../../../error";
import { ProfileObject } from "./ProfileObject";
import { toCompanyProfileSelect } from "./CompanyProfileObject";
import { toUserProfileSelect } from "./UserProfileObject";

type UpdateProfileStrategy<T> = (
    input: T,
    context: Context,
    info: GraphQLResolveInfo
) => Promise<Partial<ProfileObject>>;

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

type UpdateMyProfile = IFieldResolver<
    any,
    Context,
    Record<"input", UpdateMyProfileInput>,
    Promise<Partial<ProfileObject>>
>;

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
    const { UserProfile } = mapSelections(info);
    const select = toUserProfileSelect(UserProfile);
    const { id, dob, firstName, firstNameKana, lastName, lastNameKana } = input;
    return await store.user.update({
        where: { id },
        data: { dob, firstName, firstNameKana, lastName, lastNameKana },
        ...select,
    });
};

const updateCompanyProfile: UpdateProfileStrategy<UpdateCompanyProfileInput> = async (input, { store }, info) => {
    const { CompanyProfile } = mapSelections(info);
    const select = toCompanyProfileSelect(CompanyProfile);
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
    }
`;

export const updateMyProfileResolvers = {
    Mutation: { updateMyProfile },
};
