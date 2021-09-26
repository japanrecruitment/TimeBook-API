import { SpaceType } from "@prisma/client";
import { omit } from "@utils/object-helper";
import { gql } from "apollo-server-core";
import { PrismaSelect } from "graphql-map-selections";
import { isEmpty } from "lodash";
import { Photo, PhotoSelect, toPhotoSelect } from "../../media";

export type SpaceTypeObject = Partial<SpaceType> & {
    photo: Photo;
};

export type SpaceTypeSelect = {
    id: boolean;
    title: boolean;
    description: boolean;
    available: boolean;
    photo: PrismaSelect<PhotoSelect>;
};

export const toSpaceTypeSelect = (selections: any, defaultValue: any = false): PrismaSelect<SpaceTypeSelect> => {
    if (!selections || isEmpty(selections)) return defaultValue;

    const photoSelect = toPhotoSelect(selections.photo);
    const spaceTypeSelect = omit(selections, "photo");

    return {
        select: {
            ...spaceTypeSelect,
            id: true,
            photo: photoSelect,
        } as SpaceTypeSelect,
    };
};

export const spaceTypeObjectTypeDefs = gql`
    type SpaceTypeObject {
        id: ID!
        title: String!
        description: String!
        photo: Photo
        available: Boolean @auth(requires: [admin])
    }
`;
