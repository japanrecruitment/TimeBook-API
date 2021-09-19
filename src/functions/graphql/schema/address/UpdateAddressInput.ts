import { Address } from ".prisma/client";
import { gql } from "apollo-server-express";

export type UpdateAddressInput = Partial<Address> & { id: string };

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
