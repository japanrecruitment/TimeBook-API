import { IFieldResolver } from "@graphql-tools/utils";
import { Log } from "@utils/logger";
import { gql } from "apollo-server-core";
import { mapSelections } from "graphql-map-selections";
import { Context } from "../../../context";
import { OptionPriceOverrideObject, toOptionPriceOverrideSelect } from "./OptionPriceOverrideObject";

type OptionPriceOverrideByIdArgs = { id: string };

type OptionPriceOverrideByIdResult = Promise<OptionPriceOverrideObject>;

type OptionPriceOverrideById = IFieldResolver<any, Context, OptionPriceOverrideByIdArgs, OptionPriceOverrideByIdResult>;

const optionPriceOverrideById: OptionPriceOverrideById = async (_, { id }, { store }, info) => {
    const optionPriceOverrideSelect = toOptionPriceOverrideSelect(mapSelections(info))?.select;
    const optionPriceOverride = store.optionPriceOverride.findUnique({
        where: { id },
        select: optionPriceOverrideSelect,
    });

    Log(optionPriceOverride);

    return optionPriceOverride;
};

export const optionPriceOverrideByIdTypeDefs = gql`
    type Query {
        optionPriceOverrideById(id: ID!): OptionPriceOverrideObject
    }
`;

export const optionPriceOverrideByIdResolvers = {
    Query: { optionPriceOverrideById },
};
