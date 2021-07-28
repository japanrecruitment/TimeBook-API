import { gql } from "apollo-server-core";

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
        id: ID
        addressLine1: String!
        addressLine2: String!
        city: String!
        longitude: Float
        latitude: Float
        postalCode: String!
        prefectureId: IntID!
    }
`;
