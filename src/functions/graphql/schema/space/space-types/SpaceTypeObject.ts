import { SpaceType } from ".prisma/client";
import { gql } from "apollo-server-express";
import { toPrismaSelect } from "graphql-map-selections";
import { PrismaSelect } from "@libs/prisma-select";

export type SpaceTypeObject = Partial<SpaceType>;

export type SpaceTypeSelect = {
    id: true;
    title: true;
    description: true;
};

export const toSpaceTypeSelect = (selection) => toPrismaSelect(selection) as PrismaSelect<SpaceTypeSelect>;

export const spaceTypeObjectTypeDefs = gql`
    type SpaceTypeObject {
        id: ID!
        title: String!
        description: String!
    }
`;
