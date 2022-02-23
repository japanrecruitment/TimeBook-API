import { SpacePricePlanType } from "@prisma/client";
import { gql } from "apollo-server-core";

export type PricePlanFilterOptions = {
    fromDate: Date;
    toDate: Date;
    types?: SpacePricePlanType[];
};

export const pricePlanFilterOptionsTypeDefs = gql`
    input PricePlanFilterOptions {
        fromDate: Date!
        toDate: Date!
        types: [SpacePricePlanType]
    }
`;
