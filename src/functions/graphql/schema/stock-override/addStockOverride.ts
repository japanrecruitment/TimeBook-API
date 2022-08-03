import { gql } from "apollo-server-core";
import { GqlError } from "../../error";

export function validateAddStockOverrideInput(input: AddStockOverrideInput): AddStockOverrideInput {
    let { endDate, stock, startDate } = input;

    endDate = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());
    startDate = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());

    if (endDate < startDate) throw new GqlError({ code: "BAD_USER_INPUT", message: "Invalid date selections" });

    if (startDate < new Date()) throw new GqlError({ code: "BAD_USER_INPUT", message: "Invalid date selections" });

    if (stock < 0) throw new GqlError({ code: "BAD_USER_INPUT", message: "Invalid number of stock" });

    return { endDate, stock, startDate };
}

export type AddStockOverrideInput = {
    startDate: Date;
    endDate: Date;
    stock: number;
};

export const addStockOverrideTypeDefs = gql`
    input AddStockOverrideInput {
        startDate: Date!
        endDate: Date!
        stock: Int!
    }
`;

export const addStockOverrideResolvers = {};
