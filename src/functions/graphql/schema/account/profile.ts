import { IUnionTypeResolver } from "@graphql-tools/utils";
import { gql } from "apollo-server-core";

type UserProfile = {
    id: string;
    firstName: string;
    lastName: string;
    firstNameKana: string;
    lastNameKana: string;
    phoneNumber?: string;
    email: string;
};

type CompanyProfile = {
    id: string;
    name: string;
    nameKana: string;
    registrationNumber: string;
    phoneNumber?: string;
    email: string;
};

export type ProfileResult = UserProfile | CompanyProfile;

const ProfileResult: IUnionTypeResolver = {
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
    }

    type CompanyProfile {
        id: ID!
        email: String
        name: String!
        nameKana: String!
        phoneNumber: String
        registrationNumber: String!
    }

    union ProfileResult = UserProfile | CompanyProfile
`;

export const profileResolvers = { ProfileResult };
