import { IFieldResolver } from "@graphql-tools/utils";
import { Log } from "@utils/logger";
import { gql } from "apollo-server-core";
import { mapSelections } from "graphql-map-selections";
import { isEmpty } from "lodash";
import { Context } from "../../context";
import { GqlError } from "../../error";
import { AddStockOverrideInput, validateAddStockOverrideInput } from "./addStockOverride";
import { StockOverrideObject, toStockOverrideSelect } from "./StockOverrideObject";

type AddStockOverrideInOptionArgs = {
    optionId: string;
    stockOverride: AddStockOverrideInput;
};

type AddStockOverrideInOptionResult = {
    message: string;
    stockOverride?: StockOverrideObject;
};

type AddStockOverrideInOption = IFieldResolver<
    any,
    Context,
    AddStockOverrideInOptionArgs,
    Promise<AddStockOverrideInOptionResult>
>;

const addStockOverrideInOption: AddStockOverrideInOption = async (
    _,
    { optionId, stockOverride },
    { authData, store },
    info
) => {
    const { accountId } = authData || {};
    if (!accountId) throw new GqlError({ code: "FORBIDDEN", message: "Invalid token!!" });

    const { endDate, startDate, stock } = validateAddStockOverrideInput(stockOverride);

    const option = await store.option.findUnique({
        where: { id: optionId },
        select: {
            accountId: true,
            stockOverrides: {
                where: {
                    optionId,
                    OR: [
                        { AND: [{ startDate: { gte: startDate } }, { startDate: { lte: endDate } }] },
                        { AND: [{ endDate: { gte: startDate } }, { endDate: { lte: endDate } }] },
                    ],
                },
            },
        },
    });
    if (!option || !option.accountId) throw new GqlError({ code: "NOT_FOUND", message: "Option not found" });
    if (accountId !== option.accountId)
        throw new GqlError({ code: "FORBIDDEN", message: "You are not allowed to modify this option" });
    if (!isEmpty(option.stockOverrides))
        throw new GqlError({ code: "BAD_REQUEST", message: "Overlapping stock override found." });

    const stockOverrideSelect = toStockOverrideSelect(mapSelections(info)?.stockOverride)?.select;
    const newStockOverride = await store.stockOverride.create({
        data: {
            endDate,
            startDate,
            stock,
            option: { connect: { id: optionId } },
        },
        select: stockOverrideSelect,
    });

    Log(newStockOverride);

    return {
        message: "Successfully added stock override in option",
        stockOverride: newStockOverride,
    };
};

export const addStockOverrideInOptionTypeDefs = gql`
    type AddStockOverrideInOptionResult {
        message: String!
        stockOverride: StockOverrideObject
    }

    type Mutation {
        addStockOverrideInOption(optionId: ID!, stockOverride: AddStockOverrideInput!): AddStockOverrideInOptionResult!
            @auth(requires: [host])
    }
`;

export const addStockOverrideInOptionResolvers = { Mutation: { addStockOverrideInOption } };
