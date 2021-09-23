import { SpaceType } from "@prisma/client";
import { gql } from "apollo-server-core";
import { toPrismaSelect } from "graphql-map-selections";

export type SpaceTypeObject = Partial<SpaceType>;

export type SpaceTypeSelect = {
    id: boolean;
    title: boolean;
    description: boolean;
};

export const toSpaceTypeSelect = (selection) => toPrismaSelect<SpaceTypeSelect>(selection);

export const spaceTypeObjectTypeDefs = gql`
    type SpaceTypeObject {
        id: ID!
        title: String!
        description: String!
    }
`;
