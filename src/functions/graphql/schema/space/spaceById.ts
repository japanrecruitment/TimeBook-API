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

    Log(space);

    return space;
};

export const spaceByIdTypeDefs = gql`
    type Query {
        spaceById(id: ID!): SpaceObject
    }
`;

export const spaceByIdResolvers = {
    Query: { spaceById },
};
