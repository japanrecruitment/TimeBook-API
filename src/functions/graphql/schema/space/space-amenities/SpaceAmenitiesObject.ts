import { SpaceAmenities } from "@prisma/client";
import { gql } from "apollo-server-core";
import { PrismaSelect, toPrismaSelect } from "graphql-map-selections";

export type SpaceAmenitiesObject = Partial<SpaceAmenities>;

export type SpaceAmenitiesSelect = {
    id: boolean;
    title: boolean;
};

export const toSpaceAmenitiesSelect = (selections: any): PrismaSelect<SpaceAmenitiesSelect> => {
    return toPrismaSelect(selections);
};

export const spaceAmenititesObjectTypeDefs = gql`
    type SpaceAmenitiesObject {
        id: ID!
        title: String!
    }
`;
