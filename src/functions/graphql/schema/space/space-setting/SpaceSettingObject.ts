import { SpaceSetting } from "@prisma/client";
import { gql } from "apollo-server-core";
import { toPrismaSelect } from "graphql-map-selections";

export type SpaceSettingObject = Partial<SpaceSetting>;

export type SpaceSettingSelect = {
    id: boolean;
    totalStock: boolean;
    isDefault: boolean;
    closed: boolean;
    businessDays: boolean;
    openingHr: boolean;
    closingHr: boolean;
    breakFromHr: boolean;
    breakToHr: boolean;
    fromDate: boolean;
    toDate: boolean;
};

export const toSpaceSettingSelect = (selections: any) => toPrismaSelect<SpaceSettingSelect>(selections);

export const spaceSettingObjectTypeDefs = gql`
    type SpaceSettingObject {
        id: ID!
        totalStock: Int!
        isDefault: Boolean!
        closed: Boolean!
        businessDays: [Int]
        openingHr: Float!
        closingHr: Float!
        breakFromHr: Float
        breakToHr: Float
        fromDate: Date
        toDate: Date
    }
`;
