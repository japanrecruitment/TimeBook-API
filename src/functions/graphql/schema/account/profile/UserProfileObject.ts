import { gql } from "apollo-server-core";
import { Account, User } from "@prisma/client";
import { PrismaSelect } from "graphql-map-selections";
import { AddressObject, AddressSelect, toAddressSelect } from "../../address";
import { PhotoSelect, toPhotoSelect } from "../../media";
import { omit, pick } from "@utils/object-helper";
import { HostObject } from "../host/HostObject";
import { isEmpty } from "lodash";

export type UserProfileObject = Partial<User> &
    Partial<Pick<Account, "email" | "password">> &
    Partial<Record<"address", Partial<AddressObject>>> &
    Partial<Record<"host", Partial<HostObject>>>;

export type UserProfileSelect = {
    id: boolean;
    firstName: boolean;
    lastName: boolean;
    firstNameKana: boolean;
    lastNameKana: boolean;
    accountId: true;
    address: PrismaSelect<AddressSelect>;
    profilePhoto: PrismaSelect<PhotoSelect>;
};

export const toUserProfileSelect = (selections, defaultValue: any = false): PrismaSelect<UserProfileSelect> => {
    if (!selections || isEmpty(selections)) return defaultValue;

    const addressSelect = toAddressSelect(selections.address);
    const profilePhotoSelect = toPhotoSelect(selections.profilePhoto);
    const userProfileSelect = pick(selections, "id", "firstName", "lastName", "firstNameKana", "lastNameKana");

    if (isEmpty(userProfileSelect) && !addressSelect && !profilePhotoSelect) return defaultValue;

    return {
        select: {
            ...userProfileSelect,
            accountId: true,
            address: addressSelect,
            profilePhoto: profilePhotoSelect,
        } as UserProfileSelect,
    };
};

export const userProfileObjectTypeDefs = gql`
    type UserProfile {
        id: ID!
        email: String
        emailVerified: Boolean @auth(requires: [admin], allowSelf: true)
        firstName: String!
        lastName: String!
        firstNameKana: String!
        lastNameKana: String!
        phoneNumber: String
        roles: [Role] @auth(requires: [admin], allowSelf: true)
        address: AddressObject
        profilePhoto: Photo
        host: Host
        approved: Boolean @auth(requires: [admin], allowSelf: true)
        suspended: Boolean @auth(requires: [admin], allowSelf: true)
        createdAt: Date @auth(requires: [admin], allowSelf: true)
        updatedAt: Date @auth(requires: [admin], allowSelf: true)
    }
`;
