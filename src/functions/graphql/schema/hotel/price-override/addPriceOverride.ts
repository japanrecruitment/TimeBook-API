import { gql } from "apollo-server-core";
import { GqlError } from "../../../error";

export function validateAddPriceOverrideInput(input: AddPriceOverrideInput): AddPriceOverrideInput {
    let { endDate, priceSchemeId, startDate } = input;

    endDate = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());
    startDate = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());

    if (endDate < startDate) throw new GqlError({ code: "BAD_USER_INPUT", message: "Invalid date selections" });

    if (startDate < new Date()) throw new GqlError({ code: "BAD_USER_INPUT", message: "Invalid date selections" });

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
