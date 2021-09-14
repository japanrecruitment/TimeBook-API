import { gql } from "apollo-server-core";
import { Context } from "../../context";
import { IFieldResolver } from "@graphql-tools/utils";
import { SpaceType } from "@prisma/client";

export type SpaceTypeResult = Partial<SpaceType>;

type AllSpaceTypes = IFieldResolver<any, Context, Record<string, any>, Promise<SpaceTypeResult[]>>;

const allSpaceTypes: AllSpaceTypes = async (_, __, { store, dataSources }) => {
    const cacheKey = "space-types:all";
    const cacheDoc = await dataSources.redis.fetch(cacheKey);
    if (cacheDoc) return cacheDoc;

    const spaceTypes = await store.spaceType.findMany({
        orderBy: { title: "asc" },
    });

    if (!spaceTypes) return [];

    dataSources.redis.store(cacheKey, spaceTypes, 60 * 60 * 24 * 30 * 6);
    return spaceTypes;
};

export const allSpaceTypesTypeDefs = gql`
    type SpaceType {
        id: ID!
        title: String!
        description: String!
    }

    type Query {
        allSpaceTypes: [SpaceType]
    }
`;

export const allSpaceTypesResolvers = {
    Query: { allSpaceTypes },
};
