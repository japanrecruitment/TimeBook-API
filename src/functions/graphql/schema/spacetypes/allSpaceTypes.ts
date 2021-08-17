import { gql } from "apollo-server-core";
import { Context } from "../../context";
import { IFieldResolver } from "@graphql-tools/utils";
import { PhotoGallery, SpaceType } from "@prisma/client";
import { getUrlGenerator } from "../../../../utils/imageUrlGenerator";
export type SpaceTypeResult = Partial<SpaceType> & {
    photoGallery?: Partial<PhotoGallery>;
};

type AllSpaceTypes = IFieldResolver<any, Context, Record<string, any>, Promise<SpaceTypeResult[]>>;

const allSpaceTypes: AllSpaceTypes = async (_, __, { store, dataSources }) => {
    const cacheKey = "all-stapce-types";
    const cacheDoc = await dataSources.cacheDS.fetchFromCache(cacheKey);
    if (cacheDoc) return cacheDoc;

    const spaceTypes = await store.spaceType.findMany({
        orderBy: { title: "asc" },
    });

    if (spaceTypes) {
        dataSources.cacheDS.storeInCache(cacheKey, spaceTypes, 60 * 60 * 24 * 30 * 6);
        return spaceTypes;
    } else {
        return [];
    }
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
