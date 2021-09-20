import { Address, Prefecture } from ".prisma/client";
import { gql } from "apollo-server-express";
import { toPrismaSelect } from "graphql-map-selections";

export type AddressObject = Partial<Address> & {
    prefecture: Partial<Prefecture>;
};

export type AddressSelect = {
    id: true;
    addressLine1: true;
    addressLine2: true;
    city: true;
    longitude: true;
    latitude: true;
    postalCode: true;
    prefecture: true;
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
