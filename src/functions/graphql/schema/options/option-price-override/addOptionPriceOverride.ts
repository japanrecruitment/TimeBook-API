import { IFieldResolver } from "@graphql-tools/utils";
import { OptionPaymentTerm } from "@prisma/client";
import { Log } from "@utils/logger";
import { gql } from "apollo-server-core";
import { mapSelections } from "graphql-map-selections";
import { isEmpty } from "lodash";
import { Context } from "../../../context";
import { GqlError } from "../../../error";
import { OptionPriceOverrideObject, toOptionPriceOverrideSelect } from "./OptionPriceOverrideObject";

function validateAddOptionPriceOverrideInput(input: AddOptionPriceOverrideInput): AddOptionPriceOverrideInput {
    let { additionalPrice, endDate, paymentTerm, startDate } = input;

    endDate = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());
    startDate = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());

    if (endDate < startDate) throw new GqlError({ code: "BAD_USER_INPUT", message: "Invalid date selections" });

    if (startDate < new Date()) throw new GqlError({ code: "BAD_USER_INPUT", message: "Invalid date selections" });

    if (additionalPrice < 0)
        throw new GqlError({ code: "BAD_USER_INPUT", message: "Invalid number of additional price" });

    return { additionalPrice, endDate, paymentTerm, startDate };
}

type AddOptionPriceOverrideInput = {
    startDate: Date;
    endDate: Date;
    paymentTerm: OptionPaymentTerm;
    additionalPrice: number;
};

type AddOptionPriceOverrideArgs = {
    optionId: string;
    input: AddOptionPriceOverrideInput;
};

type AddOptionPriceOverrideResult = {
    message: string;
    optionPriceOverride?: OptionPriceOverrideObject;
};

type AddOptionPriceOverride = IFieldResolver<
    any,
    Context,
    AddOptionPriceOverrideArgs,
    Promise<AddOptionPriceOverrideResult>
>;

const addOptionPriceOverride: AddOptionPriceOverride = async (_, { input, optionId }, { authData, store }, info) => {
    const { accountId } = authData || {};
    if (!accountId) throw new GqlError({ code: "FORBIDDEN", message: "Invalid token!!" });

    const { additionalPrice, endDate, paymentTerm, startDate } = validateAddOptionPriceOverrideInput(input);

    const option = await store.option.findUnique({
        where: { id: optionId },
        select: {
            accountId: true,
            priceOverrides: {
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
    if (!option) throw new GqlError({ code: "NOT_FOUND", message: "Option not found" });
    if (accountId !== option.accountId)
        throw new GqlError({ code: "FORBIDDEN", message: "You are not allowed to modify this option" });
    if (!isEmpty(option.priceOverrides))
        throw new GqlError({ code: "BAD_REQUEST", message: "Overlapping price override found." });

    const optionPriceOverrideSelect = toOptionPriceOverrideSelect(mapSelections(info)?.optionPriceOverride)?.select;
    const newOptionPriceOverride = await store.optionPriceOverride.create({
        data: {
            additionalPrice,
            endDate,
            paymentTerm,
            startDate,
            option: { connect: { id: optionId } },
        },
        select: optionPriceOverrideSelect,
    });

    Log(newOptionPriceOverride);

    return {
        message: `Added option price override`,
        optionPriceOverride: newOptionPriceOverride,
    };
};

export const addOptionPriceOverrideTypeDefs = gql`
    input AddOptionPriceOverrideInput {
        startDate: Date!
        endDate: Date!
        paymentTerm: OptionPaymentTerm!
        additionalPrice: Int!
    }

    type AddOptionPriceOverrideResult {
        message: String!
        optionPriceOverride: OptionPriceOverrideObject
    }

    type Mutation {
        addOptionPriceOverride(optionId: ID!, input: AddOptionPriceOverrideInput!): AddOptionPriceOverrideResult
            @auth(requires: [host])
    }
`;

export const addOptionPriceOverrideResolvers = { Mutation: { addOptionPriceOverride } };
