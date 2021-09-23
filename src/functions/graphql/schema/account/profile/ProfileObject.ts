import { IUnionTypeResolver } from "@graphql-tools/utils";
import { ProfileType } from "@prisma/client";
import { gql } from "apollo-server-core";
import { PrismaSelect } from "graphql-map-selections";
import { isEmpty } from "lodash";
import { CompanyProfileSelect, toCompanyProfileSelect } from "./CompanyProfileObject";
import { UserProfileSelect, toUserProfileSelect } from "./UserProfileObject";
import { HostSelect, toHostSelect } from "../host";
import { CompanyProfileObject } from "./CompanyProfileObject";
import { UserProfileObject } from "./UserProfileObject";
import { omit, pick } from "@utils/object-helper";

export type ProfileObject = UserProfileObject | CompanyProfileObject;

export type ProfileSelect = {
    email: boolean;
    emailVerified: boolean;
    phoneNumber: boolean;
    phoneVerified: boolean;
    profileType: true;
    roles: boolean;
    approved: boolean;
    suspended: boolean;
    createdAt: boolean;
    updatedAt: boolean;
    userProfile: PrismaSelect<UserProfileSelect>;
    companyProfile: PrismaSelect<CompanyProfileSelect>;
    host: PrismaSelect<HostSelect>;
};

export const toProfileSelect = (selections, authData, defaultValue: any = false): PrismaSelect<ProfileSelect> => {
    if (!selections || isEmpty(selections)) return defaultValue;
    const { profileType, roles } = authData || {};
    const { UserProfile, CompanyProfile } = selections;
    const userProfileSelect = profileType === "UserProfile" && toUserProfileSelect(UserProfile);
    const companyProfileSelect = profileType === "CompanyProfile" && toCompanyProfileSelect(CompanyProfile);
    const hostSelect = roles?.includes("host") && toHostSelect(selections[profileType]?.host);
    const profileSelect = pick(
        selections[profileType],
        "email",
        "emailVerified",
        "phoneNumber",
        "phoneVerified",
        "profileType",
        "roles",
        "approved",
        "suspended",
        "createdAt",
        "updatedAt"
    );

    return {
        select: {
            ...profileSelect,
            userProfile: userProfileSelect,
            companyProfile: companyProfileSelect,
            host: hostSelect,
        },
    };
};

const Profile: IUnionTypeResolver = {
    __resolveType: (obj) => {
        if (obj.registrationNumber) return "CompanyProfile";
        return "UserProfile";
    },
};

export const profileObjectTypeDefs = gql`
    enum ProfileType {
        UserProfile
        CompanyProfile
    }

    union Profile = UserProfile | CompanyProfile
`;

export const profileObjectResolvers = { Profile, ProfileType };
