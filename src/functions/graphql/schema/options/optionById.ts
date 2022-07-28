import { IFieldResolver } from "@graphql-tools/utils";
import { Log } from "@utils/logger";
import { gql } from "apollo-server-core";
import { mapSelections } from "graphql-map-selections";
import { Context } from "../../context";
import { GqlError } from "../../error";
import { OptionObject, toOptionSelect } from "./OptionObject";

type OptionByIdArgs = {
    id: string;
};

type OptionByIdResult = OptionObject;

type OptionById = IFieldResolver<any, Context, OptionByIdArgs, Promise<OptionByIdResult>>;

const optionById: OptionById = async (_, { id }, { store }, info) => {
    const optionSelect = toOptionSelect(mapSelections(info))?.select;

    const option = await store.option.findUnique({
        where: { id },
        select: optionSelect,
    });

    Log(`id: `, id, `optionById: `, option);

    if (!option) throw new GqlError({ code: "NOT_FOUND", message: "Option not found" });

    return option;
};

export const optionByIdTypeDefs = gql`
    type Query {
        optionById(id: ID!): OptionObject
    }
`;

export const optionByIdResolvers = { Query: { optionById } };
