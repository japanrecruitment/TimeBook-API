import { gql } from "apollo-server-core";
import { GqlError } from "../../../error";

export function validateUpdatePriceOverrideInput(input: UpdatePriceOverrideInput): UpdatePriceOverrideInput {
    let { id, endDate, priceSchemeId, startDate } = input;

    if (endDate && startDate) {
        if (endDate < startDate) throw new GqlError({ code: "BAD_USER_INPUT", message: "無効な日付の選択" });
        if (startDate < new Date()) throw new GqlError({ code: "BAD_USER_INPUT", message: "無効な日付の選択" });
    } else {
        endDate = undefined;
        startDate = undefined;
    }

    if (!endDate && !priceSchemeId && !startDate)
        throw new GqlError({ code: "BAD_REQUEST", message: "必要な情報をすべて入力してください。" });

    return { id, endDate, priceSchemeId, startDate };
}

export type UpdatePriceOverrideInput = {
    id: string;
    startDate?: Date;
    endDate?: Date;
    priceSchemeId?: string;
};

export const updatePriceOverrideTypeDefs = gql`
    input UpdatePriceOverrideInput {
        id: ID!
        startDate: Date
        endDate: Date
        priceSchemeId: ID
    }
`;

export const updatePriceOverrideResolvers = {};
