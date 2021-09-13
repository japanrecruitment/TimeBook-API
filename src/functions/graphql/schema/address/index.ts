import { Address, Prefecture } from "@prisma/client";
import { gql } from "apollo-server-core";

export type AddressInput = Address;

export type AddressResult = Address & {
    prefecture: Prefecture;
};

export const addressTypeDefs = gql`
    type Address {
        id: ID!
        addressLine1: String!
        addressLine2: String!
        city: String!
        longitude: Float
        latitude: Float
        postalCode: String!
        prefecture: Prefecture!
    }

    input AddressInput {
        addressLine1: String!
        addressLine2: String
        city: String!
        longitude: Float
        latitude: Float
        postalCode: String!
        prefectureId: IntID!
    }
`;
