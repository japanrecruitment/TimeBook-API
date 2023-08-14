import { gql } from "apollo-server-core";
import { GqlError } from "../../error";

export function validateAddStockOverrideInput(input: AddStockOverrideInput): AddStockOverrideInput {
    let { endDate, stock, startDate } = input;

    if (endDate < startDate) throw new GqlError({ code: "BAD_USER_INPUT", message: "無効な日付の選択" });

    if (startDate < new Date()) throw new GqlError({ code: "BAD_USER_INPUT", message: "無効な日付の選択" });

    if (stock < 0) throw new GqlError({ code: "BAD_USER_INPUT", message: "在庫数が無効です" });

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
