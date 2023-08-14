import { IFieldResolver } from "@graphql-tools/utils";
import { ProfileType } from "@prisma/client";
import { Log } from "@utils/logger";
import { gql } from "apollo-server-core";
import { Context } from "../../../context";
import { GqlError } from "../../../error";
import { Result } from "../../core/result";
import { ProfileObject } from "./ProfileObject";
import { addEmailToQueue, ProfileUpdateEmailData } from "@utils/email-helper";

type UpdateProfileStrategy<T> = (input: T, context: Context) => Promise<Partial<ProfileObject>>;

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

type UpdateMyProfile = IFieldResolver<any, Context, Record<"input", UpdateMyProfileInput>, Promise<Partial<Result>>>;

const updateMyProfile: UpdateMyProfile = async (_, { input }, context) => {
    const { id, profileType, email } = context.authData;

    Log(id, context.authData);

    if (id !== input.id) throw new GqlError({ code: "FORBIDDEN", message: "無効なリクエスト" });

    const updatedProfile = await updateProfileStrategies[profileType](input, context);

    if (!updatedProfile) throw new GqlError({ code: "NOT_FOUND", message: "プロフィールが見つかりません" });

    await addEmailToQueue<ProfileUpdateEmailData>({
        template: "profile-updated",
        recipientEmail: email,
        recipientName: "",
    });

    return { message: `プロファイルが更新されました` };
};

const updateUserProfile: UpdateProfileStrategy<UpdateUserProfileInput> = async (input, { store }) => {
    const { id, dob, firstName, firstNameKana, lastName, lastNameKana } = input;
    return await store.user.update({
        where: { id },
        data: { dob, firstName, firstNameKana, lastName, lastNameKana },
    });
};

const updateCompanyProfile: UpdateProfileStrategy<UpdateCompanyProfileInput> = async (input, { store }) => {
    const { id, name, nameKana, registrationNumber } = input;
    return await store.company.update({
        where: { id },
        data: { name, nameKana, registrationNumber },
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
        updateMyProfile(input: UpdateMyProfileInput!): Result @auth(requires: [user, host])
    }
`;

export const updateMyProfileResolvers = {
    Mutation: { updateMyProfile },
};
