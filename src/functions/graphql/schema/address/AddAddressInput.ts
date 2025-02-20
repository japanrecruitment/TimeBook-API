import { gql } from "apollo-server-core";
import { isEmpty } from "lodash";
import { GqlError } from "../../error";

export function validateAddAddressInput(input: AddAddressInput): AddAddressInput {
    let { addressLine1, city, postalCode, prefectureId, addressLine2 } = input;

    addressLine1 = addressLine1?.trim();
    city = city?.trim();
    postalCode = postalCode?.trim();
    addressLine2 = addressLine2?.trim();

    if (isEmpty(addressLine1)) throw new GqlError({ code: "BAD_USER_INPUT", message: "住所が空白です。" });

    if (isEmpty(city)) throw new GqlError({ code: "BAD_USER_INPUT", message: "都市を空にすることはできません" });

    if (isEmpty(postalCode))
        throw new GqlError({ code: "BAD_USER_INPUT", message: "郵便番号を空白にすることはできません" });

    if (!prefectureId) throw new GqlError({ code: "BAD_USER_INPUT", message: "都道府県は必須です" });

    return { addressLine1, city, postalCode, prefectureId, addressLine2 };
}

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
