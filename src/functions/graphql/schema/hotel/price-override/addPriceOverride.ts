import { gql } from "apollo-server-core";
import { GqlError } from "../../../error";

export function validateAddPriceOverrideInput(input: AddPriceOverrideInput): AddPriceOverrideInput {
    let { endDate, priceSchemeId, startDate } = input;

    if (endDate < startDate) throw new GqlError({ code: "BAD_USER_INPUT", message: "無効な日付の選択" });

    if (startDate < new Date()) throw new GqlError({ code: "BAD_USER_INPUT", message: "無効な日付の選択" });

    return { endDate, priceSchemeId, startDate };
}

export type AddPriceOverrideInput = {
    startDate: Date;
    endDate: Date;
    priceSchemeId: string;
};

export const addPriceOverrideTypeDefs = gql`
    input AddPriceOverrideInput {
        startDate: Date!
        endDate: Date!
        priceSchemeId: ID!
    }
`;

export const addPriceOverrideResolvers = {};
