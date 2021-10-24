import { gql } from "apollo-server-core";

export type AddAddressInput = {
    addressLine1: string;
    addressLine2?: string;
    city: string;
    longitude?: number;
    latitude?: number;
    postalCode: string;
    prefectureId: number;
};

export const addAddressInputTypeDefs = gql`
    input AddAddressInput {
        addressLine1: String!
        addressLine2: String
        city: String!
        longitude: Float
        latitude: Float
        postalCode: String!
        prefectureId: IntID!
    }
`;
