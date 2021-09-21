import { IUnionTypeResolver } from "@graphql-tools/utils";
import { Account, Company, ProfileType, User } from "@prisma/client";
import { omit } from "@utils/object-helper";
import { gql } from "apollo-server-core";
import { PrismaSelect } from "graphql-map-selections";
import { AddressObject, AddressSelect, toAddressSelect } from "../address";
import { PhotoSelect, toPhotoSelect } from "../media";

export type UserProfile = Partial<User> &
    Partial<Pick<Account, "email" | "password">> &
    Partial<Record<"address", AddressObject>>;

export type UserProfileSelect = {
    id: boolean;
    firstName: boolean;
    lastName: boolean;
    firstNameKana: boolean;
    lastNameKana: boolean;
    address: PrismaSelect<AddressSelect>;
    profilePhoto: PrismaSelect<PhotoSelect>;
};

export const toUserProfileSelect = (selections): PrismaSelect<UserProfileSelect> => {
    if (!selections) return;
    const addressSelect = toAddressSelect(selections.address);
    const profilePhotoSelect = toPhotoSelect(selections.profilePhoto);
    const userProfileSelect = omit(selections, "email", "phoneNumber", "roles", "address", "profilePhoto");

    return {
        select: {
            ...userProfileSelect,
            address: addressSelect,
            profilePhoto: profilePhotoSelect,
        } as UserProfileSelect,
    };
};

export type CompanyProfile = Partial<Company> &
    Partial<Pick<Account, "email" | "password">> &
    Partial<Record<"address", AddressObject>>;

export type CompanyProfileSelect = {
    id: boolean;
    name: boolean;
    nameKana: boolean;
    registrationNumber: boolean;
    address: PrismaSelect<AddressSelect>;
    profilePhoto: PrismaSelect<PhotoSelect>;
};

export const toCompanyProfileSelect = (selections): PrismaSelect<CompanyProfileSelect> => {
    const addressSelect = toAddressSelect(selections.address);
    const profilePhotoSelect = toPhotoSelect(selections.profilePhoto);
    const companyProfileSelect = omit(selections, "email", "phoneNumber", "roles", "address", "profilePhoto");

    return {
        select: {
            ...companyProfileSelect,
            address: addressSelect,
            profilePhoto: profilePhotoSelect,
        } as CompanyProfileSelect,
    };
};

export type Profile = UserProfile | CompanyProfile;

const Profile: IUnionTypeResolver = {
    __resolveType: (obj) => {
        if (obj.registrationNumber) return "CompanyProfile";
        return "UserProfile";
    },
};

export const profileTypeDefs = gql`
    enum ProfileType {
        UserProfile
        CompanyProfile
    }

    type UserProfile {
        id: ID!
        email: String
        firstName: String!
        lastName: String!
        firstNameKana: String!
        lastNameKana: String!
        phoneNumber: String
        roles: [Role]
        address: AddressObject
        profilePhoto: Photo
    }

    type CompanyProfile {
        id: ID!
        email: String
        name: String!
        nameKana: String!
        phoneNumber: String
        registrationNumber: String!
        roles: [Role]
        address: AddressObject
        profilePhoto: Photo
    }

    union Profile = UserProfile | CompanyProfile
`;

export const profileResolvers = { Profile, ProfileType };
