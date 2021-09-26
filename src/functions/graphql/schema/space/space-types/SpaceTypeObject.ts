import { SpaceType } from "@prisma/client";
import { gql } from "apollo-server-core";
import { toPrismaSelect } from "graphql-map-selections";
import { Photo } from "../../media";

export type SpaceTypeObject = Partial<SpaceType>;

export type SpaceTypeSelect = {
    id: boolean;
    title: boolean;
    description: boolean;
    photo: Photo;
};

export const toSpaceTypeSelect = (selection) => toPrismaSelect<SpaceTypeSelect>(selection);

export const spaceTypeObjectTypeDefs = gql`
    type SpaceTypeObject {
        id: ID!
        title: String!
        description: String!
        photo: Photo
        available: Boolean @auth(requires: [admin])
    }
`;
