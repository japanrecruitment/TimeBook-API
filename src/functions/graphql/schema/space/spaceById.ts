import { IFieldResolver } from "@graphql-tools/utils";
import { Log } from "@utils/logger";
import { omit } from "@utils/object-helper";
import { gql } from "apollo-server-core";
import { mapSelections, toPrismaSelect } from "graphql-map-selections";
import { Context } from "../../context";
import { GqlError } from "../../error";
import { SpaceResult } from "./allSpaces";

type SpaceById = IFieldResolver<any, Context, Record<"id", string>, Promise<SpaceResult>>;

const spaceById: SpaceById = async (_, { id }, { store }, info) => {
    const gqlSelect = mapSelections(info);
    const nearestStationsSelect = toPrismaSelect(gqlSelect.nearestStations);
    const spacePricePlansSelect = toPrismaSelect(gqlSelect.spacePricePlans);
    const spaceTypesSelect = toPrismaSelect(gqlSelect.spaceTypes);
    const spaceSelect = omit(gqlSelect, "nearestStations", "spacePricePlan", "spaceTypes");

    const space = await store.space.findUnique({
        where: { id },
        select: {
            ...spaceSelect,
            nearestStations: nearestStationsSelect,
            spacePricePlans: spacePricePlansSelect,
            spaceTypes: spaceTypesSelect ? { select: { spaceType: spaceTypesSelect } } : undefined,
        },
    });

    if (!space) throw new GqlError({ code: "NOT_FOUND", message: "Space not found" });

    const spaceTypes = space.spaceTypes.map((spaceType) => spaceType.spaceType);

    const result = { ...space, spaceTypes };

    Log(result);

    return result;
};

export const spaceByIdTypeDefs = gql`
    type Query {
        spaceById(id: ID!): Space
    }
`;

export const spaceByIdResolvers = {
    Query: { spaceById },
};
