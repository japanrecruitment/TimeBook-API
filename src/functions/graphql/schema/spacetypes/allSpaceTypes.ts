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
    const spaceTypes = await store.spaceType.findMany({
        orderBy: { title: "asc" },
        take: 20,
        skip: 0,
        include: {
            Media: {
                select: { photoGallery: true },
            },
        },
    });
    spaceTypes.forEach((x) => (x.Media.photoGallery.original = getUrlGenerator(x.Media.photoGallery.original)));
    const result = spaceTypes.map((spaceType) => {
        const photoGallery = spaceType.Media.photoGallery;
        return { ...spaceType, photoGallery };
    });

    return result || [];
};

export const allSpaceTypesTypeDefs = gql`
    type SpaceType {
        id: ID!
        title: String!
        description: String!
        photoGallery: PhotoGallery!
    }

    type Query {
        allSpaceTypes: [SpaceType]
    }
`;
export const allSpaceTypesResolvers = {
    Query: { allSpaceTypes },
};
