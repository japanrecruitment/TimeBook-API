import { PricePlanOverride } from "@prisma/client";
import { gql } from "apollo-server-core";
import { toPrismaSelect } from "graphql-map-selections";

export type PricePlanOverrideObject = Partial<PricePlanOverride>;

export type PricePlanOverrideSelect = {
    id: boolean;
    type: boolean;
    amount: boolean;
    daysOfWeek: boolean;
    fromDate: boolean;
    toDate: boolean;
};

export const toPricePlanOverrideSelect = (selections) => toPrismaSelect<PricePlanOverrideSelect>(selections);

export const pricePlanOverrideObjectTypeDefs = gql`
    enum PricePlanOverrideType {
        DAY_OF_WEEK
        DATE_TIME
    }

    type PricePlanOverrideObject {
        id: ID!
        type: PricePlanOverrideType
        amount: Float
        daysOfWeek: [Int]
        fromDate: Date
        toDate: Date
    }
`;
