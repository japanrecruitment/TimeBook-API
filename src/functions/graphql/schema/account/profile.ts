import { IUnionTypeResolver } from "@graphql-tools/utils";
import { Company, User } from "@prisma/client";
import { gql } from "apollo-server-core";

export type ProfileResult = User | Company;

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
