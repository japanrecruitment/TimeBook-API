import { IUnionTypeResolver } from "@graphql-tools/utils";
import { ProfileType } from "@prisma/client";
import { gql } from "apollo-server-core";
import { CompanyProfileObject } from "./CompanyProfile";
import { UserProfileObject } from "./UserProfileObject";

export type ProfileObject = UserProfileObject | CompanyProfileObject;

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
