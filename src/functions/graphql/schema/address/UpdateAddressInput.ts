import { gql } from "apollo-server-core";
import { GqlError } from "../../error";

export function validateUpdateAddressInput(input: UpdateAddressInput): UpdateAddressInput {
    let { id, addressLine1, city, postalCode, prefectureId, addressLine2 } = input;

    addressLine1 = addressLine1?.trim();
    city = city?.trim();
    postalCode = postalCode?.trim();
    addressLine2 = addressLine2?.trim();

    if (addressLine1 === "") throw new GqlError({ code: "BAD_USER_INPUT", message: "Address line 1 cannot be empty" });

    if (city === "") throw new GqlError({ code: "BAD_USER_INPUT", message: "City cannot be empty" });

    if (postalCode === "") throw new GqlError({ code: "BAD_USER_INPUT", message: "Postal code cannot be empty" });

    return { id, addressLine1, city, postalCode, prefectureId, addressLine2 };
}

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
