import { gql } from "apollo-server-core";
import { Account, Company } from "@prisma/client";
import { AddressObject, AddressSelect, toAddressSelect } from "../../address";
import { PrismaSelect } from "graphql-map-selections";
import { PhotoSelect, toPhotoSelect } from "../../media";
import { omit } from "@utils/object-helper";
import { HostObject } from "../host/HostObject";
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
    address: PrismaSelect<AddressSelect>;
    profilePhoto: PrismaSelect<PhotoSelect>;
};

export const toCompanyProfileSelect = (selections, defaultValue: any = false): PrismaSelect<CompanyProfileSelect> => {
    if (!selections || isEmpty(selections)) return defaultValue;
    const addressSelect = toAddressSelect(selections.address);
    const profilePhotoSelect = toPhotoSelect(selections.profilePhoto);
    const companyProfileSelect = omit(selections, "email", "phoneNumber", "roles", "host", "address", "profilePhoto");

    if (isEmpty(companyProfileSelect) && !addressSelect && !profilePhotoSelect) return defaultValue;

    return {
        select: {
            ...companyProfileSelect,
            address: addressSelect,
            profilePhoto: profilePhotoSelect,
        } as CompanyProfileSelect,
    };
};

export const companyProfileObjectTypeDefs = gql`
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
        host: Host
    }
`;
