import { Address } from ".prisma/client";
import { gql } from "apollo-server-express";

export type AddAddressInput = Address;

export const addAddressInputTypeDefs = gql`
    input AddAddressInput {
        id: ID!
        addressLine1: String!
        addressLine2: String
        city: String!
        longitude: Float
        latitude: Float
        postalCode: String!
        prefectureId: IntID!
    }
`;
