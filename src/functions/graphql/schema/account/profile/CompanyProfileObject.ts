import { gql } from "apollo-server-core";
import { Account, Company } from "@prisma/client";
import { AddressObject, AddressSelect, toAddressSelect } from "../../address";
import { PrismaSelect } from "graphql-map-selections";
import { PhotoSelect, toPhotoSelect } from "../../media";
import { omit, pick } from "@utils/object-helper";
import { HostObject, toHostSelect } from "../host/HostObject";
import { isEmpty } from "lodash";

export type CompanyProfileObject = Partial<Company> &
    Partial<Pick<Account, "email" | "password">> &
    Partial<Record<"address", Partial<AddressObject>>> &
    Partial<Record<"host", Partial<HostObject>>>;

export type CompanyProfileSelect = {
    id: boolean;
    name: boolean;
    nameKana: boolean;
    registrationNumber: boolean;
    accountId: true;
    address: PrismaSelect<AddressSelect>;
    profilePhoto: PrismaSelect<PhotoSelect>;
};

export const toCompanyProfileSelect = (selections, defaultValue: any = false): PrismaSelect<CompanyProfileSelect> => {
    if (!selections || isEmpty(selections)) return defaultValue;
    const addressSelect = toAddressSelect(selections.address);
    const profilePhotoSelect = toPhotoSelect(selections.profilePhoto);
    const hostSelect = toHostSelect(selections.host);
    const companyProfileSelect = pick(selections, "id", "name", "nameKana", "registrationNumber");

    if (isEmpty(companyProfileSelect) && !addressSelect && !profilePhotoSelect && !hostSelect) return defaultValue;

    return {
        select: {
            ...companyProfileSelect,
            accountId: true,
            address: addressSelect,
            profilePhoto: profilePhotoSelect,
            host: hostSelect,
        } as CompanyProfileSelect,
    };
};

export const companyProfileObjectTypeDefs = gql`
    type CompanyProfile {
        id: ID!
        accountId: ID!
        email: String
        emailVerified: Boolean @auth(requires: [admin], allowSelf: true)
        name: String!
        nameKana: String!
        phoneNumber: String
        registrationNumber: String!
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
