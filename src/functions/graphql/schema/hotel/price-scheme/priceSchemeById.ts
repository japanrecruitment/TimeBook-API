import { IFieldResolver } from "@graphql-tools/utils";
import { Log } from "@utils/logger";
import { gql } from "apollo-server-core";
import { mapSelections } from "graphql-map-selections";
import { Context } from "../../../context";
import { GqlError } from "../../../error";
import { PriceSchemeObject, toPriceSchemeSelect } from "./PriceSchemeObject";

type PriceSchemeByIdArgs = {
    id: string;
};

type PriceSchemeByIdResult = PriceSchemeObject;

type PriceSchemeById = IFieldResolver<any, Context, PriceSchemeByIdArgs, Promise<PriceSchemeByIdResult>>;

const priceSchemeById: PriceSchemeById = async (_, { id }, { authData, store }, info) => {
    const priceSchemeSelect = toPriceSchemeSelect(mapSelections(info))?.select;

    const priceScheme = await store.priceScheme.findUnique({
        where: { id },
        select: priceSchemeSelect,
    });

    Log(`id: `, id, `priceSchemeById: `, priceScheme);

    if (!priceScheme) throw new GqlError({ code: "NOT_FOUND", message: "Price scheme room not found" });

    return priceScheme;
};

export const priceSchemeByIdTypeDefs = gql`
    type Query {
        priceSchemeById(id: ID!): PriceSchemeObject
    }
`;

export const priceSchemeByIdResolvers = { Query: { priceSchemeById } };
