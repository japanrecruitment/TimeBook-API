import { gql } from "apollo-server-core";

export type AddAddressInput = {
    addressLine1: string;
    addressLine2?: string;
    city: string;
    postalCode: string;
    prefectureId: number;
};

export const addAddressInputTypeDefs = gql`
    input AddAddressInput {
        addressLine1: String!
        addressLine2: String
        city: String!
        postalCode: String!
        prefectureId: IntID!
    }
`;
