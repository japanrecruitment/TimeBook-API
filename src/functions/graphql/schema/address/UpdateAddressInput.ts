import { gql } from "apollo-server-core";

export type UpdateAddressInput = {
    id: string;
    addressLine1?: string;
    addressLine2?: string;
    city?: string;
    longitude?: number;
    latitude?: number;
    postalCode?: string;
    prefectureId?: number;
};

export const updateAddressInputTypeDefs = gql`
    input UpdateAddressInput {
        id: ID!
        addressLine1: String
        addressLine2: String
        city: String
        longitude: Float
        latitude: Float
        postalCode: String
        prefectureId: IntID
    }
`;
