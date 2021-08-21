import { IUnionTypeResolver } from "@graphql-tools/utils";
import { Account, Company, ProfileType, User } from "@prisma/client";
import { gql } from "apollo-server-core";
import { AddressResult } from "../address";

export type UserProfile = User &
    Partial<Pick<Account, "email" | "password">> &
    Partial<Record<"address", AddressResult>>;

export type CompanyProfile = Company &
    Partial<Pick<Account, "email" | "password">> &
    Partial<Record<"address", AddressResult>>;

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
        address: Address
    }

    type CompanyProfile {
        id: ID!
        email: String
        name: String!
        nameKana: String!
        phoneNumber: String
        registrationNumber: String!
        roles: [Role]
        address: Address
    }

    union Profile = UserProfile | CompanyProfile
`;

export const profileResolvers = { Profile, ProfileType };
