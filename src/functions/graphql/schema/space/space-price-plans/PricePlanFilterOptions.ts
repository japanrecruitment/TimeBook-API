import { gql } from "apollo-server-core";

export type PricePlanFilterOptions = {
    fromDate?: Date;
    toDate?: Date;
};

export const pricePlanFilterOptionsTypeDefs = gql`
    input PricePlanFilterOptions {
        fromDate: Date
        toDate: Date
    }
`;
