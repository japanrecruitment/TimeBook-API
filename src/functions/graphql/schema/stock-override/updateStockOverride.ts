import { gql } from "apollo-server-core";
import { GqlError } from "../../error";

export function validateUpdateStockOverrideInput(input: UpdateStockOverrideInput): UpdateStockOverrideInput {
    let { id, endDate, stock, startDate } = input;

    if (endDate && startDate) {
        if (endDate < startDate) throw new GqlError({ code: "BAD_USER_INPUT", message: "無効な日付の選択" });
        if (startDate < new Date()) throw new GqlError({ code: "BAD_USER_INPUT", message: "無効な日付の選択" });
    } else {
        endDate = undefined;
        startDate = undefined;
    }

    if (stock && stock < 0) throw new GqlError({ code: "BAD_USER_INPUT", message: "在庫数が無効です" });

    if (!endDate && !stock && !startDate) throw new GqlError({ code: "BAD_REQUEST", message: "無効なリクエスト" });

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
