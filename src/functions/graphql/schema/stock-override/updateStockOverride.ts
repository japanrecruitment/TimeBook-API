import { gql } from "apollo-server-core";
import { GqlError } from "../../error";

export function validateUpdateStockOverrideInput(input: UpdateStockOverrideInput): UpdateStockOverrideInput {
    let { id, endDate, stock, startDate } = input;

    if (endDate && startDate) {
        endDate = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());
        startDate = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
        if (endDate < startDate) throw new GqlError({ code: "BAD_USER_INPUT", message: "Invalid date selections" });
        if (startDate < new Date()) throw new GqlError({ code: "BAD_USER_INPUT", message: "Invalid date selections" });
    } else {
        endDate = undefined;
        startDate = undefined;
    }

    if (stock && stock < 0) throw new GqlError({ code: "BAD_USER_INPUT", message: "Invalid number of stock" });

    if (!endDate && !stock && !startDate) throw new GqlError({ code: "BAD_REQUEST", message: "Empty fields provided" });

    return { id, endDate, stock, startDate };
}

export type UpdateStockOverrideInput = {
    id: string;
    startDate?: Date;
    endDate?: Date;
    stock?: number;
};

export const updateStockOverrideTypeDefs = gql`
    input UpdateStockOverrideInput {
        id: ID!
        startDate: Date
        endDate: Date
        stock: Int
    }
`;

export const updateStockOverrideResolvers = {};
