import { IFieldResolver } from "@graphql-tools/utils";
import { Log } from "@utils/logger";
import { gql } from "apollo-server-core";
import { mapSelections } from "graphql-map-selections";
import { Context } from "../../context";
import { GqlError } from "../../error";
import { UpdateStockOverrideInput, validateUpdateStockOverrideInput } from "./updateStockOverride";
import { StockOverrideObject, toStockOverrideSelect } from "./StockOverrideObject";
import { isEmpty } from "lodash";

type UpdateStockOverrideInOptionArgs = {
    input: UpdateStockOverrideInput;
};

type UpdateStockOverrideInOptionResult = {
    message: string;
    stockOverride?: StockOverrideObject;
};

type UpdateStockOverrideInOption = IFieldResolver<
    any,
    Context,
    UpdateStockOverrideInOptionArgs,
    Promise<UpdateStockOverrideInOptionResult>
>;

const updateStockOverrideInOption: UpdateStockOverrideInOption = async (_, { input }, { authData, store }, info) => {
    const { accountId } = authData || {};
    if (!accountId) throw new GqlError({ code: "FORBIDDEN", message: "Invalid token!!" });

    const { id, endDate, startDate, stock } = validateUpdateStockOverrideInput(input);

    const stockOverride = await store.stockOverride.findUnique({
        where: { id },
        select: {
            option: {
                select: {
                    accountId: true,
                    stockOverrides:
                        endDate && startDate
                            ? {
                                  where: {
                                      id: { not: id },
                                      OR: [
                                          { AND: [{ startDate: { gte: startDate } }, { startDate: { lte: endDate } }] },
                                          { AND: [{ endDate: { gte: startDate } }, { endDate: { lte: endDate } }] },
                                      ],
                                  },
                              }
                            : undefined,
                },
            },
        },
    });
    if (!stockOverride || !stockOverride.option)
        throw new GqlError({ code: "NOT_FOUND", message: "Stock override not found" });
    if (accountId !== stockOverride.option.accountId)
        throw new GqlError({ code: "FORBIDDEN", message: "You are not allowed to modify this option" });
    if (!isEmpty(stockOverride.option.stockOverrides))
        throw new GqlError({ code: "BAD_REQUEST", message: "Overlapping stock override found." });

    const stockOverrideSelect = toStockOverrideSelect(mapSelections(info)?.stockOverride)?.select;
    const newStockOverride = await store.stockOverride.update({
        where: { id },
        data: { endDate, startDate, stock },
        select: stockOverrideSelect,
    });

    Log(newStockOverride);

    return {
        message: "Successfully updated stock override in option",
        stockOverride: newStockOverride,
    };
};

export const updateStockOverrideInOptionTypeDefs = gql`
    type UpdateStockOverrideInOptionResult {
        message: String!
        stockOverride: StockOverrideObject
    }

    type Mutation {
        updateStockOverrideInOption(input: UpdateStockOverrideInput!): UpdateStockOverrideInOptionResult!
            @auth(requires: [host])
    }
`;

export const updateStockOverrideInOptionResolvers = { Mutation: { updateStockOverrideInOption } };