import { IUnionTypeResolver } from "@graphql-tools/utils";
import { Account, Address, Company, User } from "@prisma/client";
import { gql } from "apollo-server-core";

export type UserProfile = User & Partial<Pick<Account, "email" | "password">> & Partial<Record<"address", Address>>;

export type CompanyProfile = Company &
    Partial<Pick<Account, "email" | "password">> &
    Partial<Record<"address", Address>>;

export type Profile = UserProfile | CompanyProfile;

const Profile: IUnionTypeResolver = {
    __resolveType: (obj) => {
        if (obj.registrationNumber) return "CompanyProfile";
        return "UserProfile";
    },
};

export const profileTypeDefs = gql`
    type UserProfile {
        id: ID!
        email: String
        firstName: String!
        lastName: String!
        firstNameKana: String!
        lastNameKana: String!
        phoneNumber: String
        address: Address
    }

    type CompanyProfile {
        id: ID!
        email: String
        name: String!
        nameKana: String!
        phoneNumber: String
        registrationNumber: String!
        address: Address
    }

    union Profile = UserProfile | CompanyProfile
`;

export const profileResolvers = { Profile };
