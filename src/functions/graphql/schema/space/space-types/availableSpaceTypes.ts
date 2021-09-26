import { IFieldResolver } from "@graphql-tools/utils";
import { gql } from "apollo-server-core";
import { Context } from "../../../context";
import { SpaceTypeObject } from ".";

type AvailableSpaceTypesArgs = any;

type AvailableSpaceTypesResult = Promise<Array<SpaceTypeObject>>;

type AvailableSpaceTypes = IFieldResolver<any, Context, AvailableSpaceTypesArgs, AvailableSpaceTypesResult>;

const availableSpaceTypes: AvailableSpaceTypes = async (_, __, { dataSources, store }) => {
    const cacheKey = "space-types:available";
    const cacheDoc = await dataSources.redis.fetch(cacheKey);
    if (cacheDoc) return cacheDoc;

    const availableSpaceTypes = await store.spaceType.findMany({
        where: { available: true },
        orderBy: { title: "asc" },
        include: { photo: true },
    });

    if (!availableSpaceTypes) return [];

    dataSources.redis.store(cacheKey, availableSpaceTypes, 60 * 60 * 24 * 30 * 6);
    return availableSpaceTypes;
};

export const availableSpaceTypesTypeDefs = gql`
    type Query {
        availableSpaceTypes: [SpaceTypeObject]!
    }
`;

export const availableSpaceTypesResolvers = {
    Query: { availableSpaceTypes },
};
