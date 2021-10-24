import { Address, Prefecture } from "@prisma/client";
import { gql } from "apollo-server-core";
import { toPrismaSelect } from "graphql-map-selections";

export type AddressObject = Partial<Address> & {
    prefecture: Partial<Prefecture>;
};

export type AddressSelect = {
    id: boolean;
    addressLine1: boolean;
    addressLine2: boolean;
    city: boolean;
    longitude: boolean;
    latitude: boolean;
    postalCode: boolean;
    prefecture: boolean;
};

export const toAddressSelect = (selections) => toPrismaSelect<AddressSelect>(selections);

export const addressObjectTypeDefs = gql`
    type AddressObject {
        id: ID!
        addressLine1: String
        addressLine2: String
        city: String
        longitude: Float
        latitude: Float
        postalCode: String
        prefecture: Prefecture
    }
`;
