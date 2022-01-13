import { gql } from "apollo-server-core";

export type UpdateAddressInput = {
    id: string;
    addressLine1?: string;
    addressLine2?: string;
    city?: string;
    postalCode?: string;
    prefectureId?: number;
};

export const updateAddressInputTypeDefs = gql`
    input UpdateAddressInput {
        id: ID!
        addressLine1: String
        addressLine2: String
        city: String
        postalCode: String
        prefectureId: IntID
    }
`;
