import { IFieldResolver } from "@graphql-tools/utils";
import { gql } from "apollo-server-core";
import { Context } from "../../../context";
import { SpaceTypeObject } from ".";

type AllSpaceTypeArgs = any;

type AllSpaceTypeResult = Promise<Array<SpaceTypeObject>>;

type AllSpaceType = IFieldResolver<any, Context, AllSpaceTypeArgs, AllSpaceTypeResult>;

const allSpaceTypes: AllSpaceType = async (_, __, { dataSources, store }) => {
    const cacheKey = "space-types:all";
    const cacheDoc = await dataSources.redis.fetch(cacheKey);
    if (cacheDoc) return cacheDoc;

    const allSpaceTypes = await store.spaceType.findMany({ orderBy: { id: "asc" }, include: { photo: true } });

    if (!allSpaceTypes) return [];

    dataSources.redis.store(cacheKey, allSpaceTypes, 60 * 60 * 24 * 30 * 6);
    return allSpaceTypes;
};

export const allSpaceTypesTypeDefs = gql`
    type Query {
        allSpaceTypes: [SpaceTypeObject]! @auth(requires: [admin])
    }
`;

export const allSpaceTypesResolvers = {
    Query: { allSpaceTypes },
};
