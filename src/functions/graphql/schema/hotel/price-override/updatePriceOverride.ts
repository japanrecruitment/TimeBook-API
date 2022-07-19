import { gql } from "apollo-server-core";
import { GqlError } from "../../../error";

export function validateUpdatePriceOverrideInput(input: UpdatePriceOverrideInput): UpdatePriceOverrideInput {
    let { id, endDate, priceSchemeId, startDate } = input;

    if (endDate && startDate) {
        endDate = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());
        startDate = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
        if (endDate < startDate) throw new GqlError({ code: "BAD_USER_INPUT", message: "Invalid date selections" });
        if (startDate < new Date()) throw new GqlError({ code: "BAD_USER_INPUT", message: "Invalid date selections" });
    } else {
        endDate = undefined;
        startDate = undefined;
    }

    if (!endDate && !priceSchemeId && !startDate)
        throw new GqlError({ code: "BAD_REQUEST", message: "Empty fields provided" });

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
