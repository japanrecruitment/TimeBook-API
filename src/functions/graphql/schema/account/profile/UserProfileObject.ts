import { gql } from "apollo-server-core";
import { Account, User } from "@prisma/client";
import { PrismaSelect } from "graphql-map-selections";
import { AddressObject, AddressSelect, toAddressSelect } from "../../address";
import { PhotoSelect, toPhotoSelect } from "../../media";
import { omit } from "@utils/object-helper";
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
    address: PrismaSelect<AddressSelect>;
    profilePhoto: PrismaSelect<PhotoSelect>;
};

export const toUserProfileSelect = (selections, defaultValue: any = false): PrismaSelect<UserProfileSelect> => {
    if (!selections || isEmpty(selections)) return defaultValue;

    const addressSelect = toAddressSelect(selections.address);
    const profilePhotoSelect = toPhotoSelect(selections.profilePhoto);
    const userProfileSelect = omit(selections, "email", "phoneNumber", "roles", "host", "address", "profilePhoto");

    if (isEmpty(userProfileSelect) && !addressSelect && !profilePhotoSelect) return defaultValue;

    return {
        select: {
            ...userProfileSelect,
            address: addressSelect,
            profilePhoto: profilePhotoSelect,
        } as UserProfileSelect,
    };
};

export const userProfileObjectTypeDefs = gql`
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
        host: Host
    }
`;
