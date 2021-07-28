import { gql } from "apollo-server-core";
import { Context } from "../../context";
import { IFieldResolver } from "@graphql-tools/utils";
import { SpaceType } from "@prisma/client";

type AllSpaceTypes = IFieldResolver<any, Context, Record<string, any>, Promise<SpaceType[]>>;

const allSpaceTypes: AllSpaceTypes = async (_, __, { store, dataSources }) => {
    const spaceTypes = await store.spaceType.findMany({
        orderBy: { title: "asc" },
        take: 20,
        skip: 0,
    });

    return spaceTypes || [];
};

export const allSpaceTypesTypeDefs = gql`
    type SpaceType {
        id: ID!
        title: String!
        description: String!
    }

    type Query {
        allSpaceTypes: [SpaceType] @auth(requires: [user, host])
    }
`;
export const allSpaceTypesResolvers = {
    Query: { allSpaceTypes },
};
