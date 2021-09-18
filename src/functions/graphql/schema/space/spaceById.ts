import { IFieldResolver } from "@graphql-tools/utils";
import { Log } from "@utils/logger";
import { gql } from "apollo-server-core";
import { mapSelections } from "graphql-map-selections";
import { Context } from "../../context";
import { GqlError } from "../../error";
import { SpaceObject, toSpaceSelect } from "./SpaceObject";

type SpaceById = IFieldResolver<any, Context, Record<"id", string>, Promise<SpaceObject>>;

const spaceById: SpaceById = async (_, { id }, { store }, info) => {
    const space = await store.space.findUnique({
        where: { id },
        ...toSpaceSelect(mapSelections(info)),
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
