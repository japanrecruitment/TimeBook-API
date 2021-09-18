import { SpaceType } from ".prisma/client";
import { gql } from "apollo-server-express";
import { toPrismaSelect } from "graphql-map-selections";

export type SpaceTypeObject = Partial<SpaceType>;

export type SpaceTypeSelect = {
    id: true;
    title: true;
    descript: true;
};

export const toSpaceTypeSelect = (selection) => toPrismaSelect<SpaceTypeSelect>(selection);

export const spaceTypeObjectTypeDefs = gql`
    type SpaceTypeObject {
        id: ID!
        title: String!
        description: String!
    }
`;
