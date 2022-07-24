import { CancelPolicy } from "@prisma/client";
import { gql } from "apollo-server-core";
import { PrismaSelect, toPrismaSelect } from "graphql-map-selections";

export type CancelPolicyObject = Partial<CancelPolicy>;

export type CancelPolicySelect = {
    id: boolean;
    spaceId: boolean;
    hotelId: boolean;
    beforeHours: boolean;
    percentage: boolean;
    createdAt: boolean;
    updatedAt: boolean;
};

export const toCancelPolicySelect = (selections, defaultValue: any = false): PrismaSelect<CancelPolicySelect> => {
    return toPrismaSelect(selections, defaultValue);
};

export const cancelPolicyObjectTypeDefs = gql`
    type CancelPolicyObject {
        id: ID
        spaceId: ID
        hotelId: ID
        beforeHours: Float
        percentage: Float
        createdAt: Date
        updatedAt: Date
    }
`;
