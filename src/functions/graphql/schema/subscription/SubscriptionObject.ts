import { gql } from "apollo-server-core";
import { PrismaSelect, toPrismaSelect } from "graphql-map-selections";
import { isEmpty } from "lodash";

export type SubscriptionObject = {
    id: string;
    amount: number;
    currentPeriodEnd: Date;
    currentPeriodStart: Date;
    name: string;
    remainingUnit: number;
    type: string;
    unit: number;
};

export type SubscriptionSelect = {
    id: boolean;
    amount: boolean;
    currentPeriodEnd: boolean;
    currentPeriodStart: boolean;
    name: boolean;
    remainingUnit: boolean;
    type: boolean;
    unit: boolean;
};

export const toSubscriptionSelect = (selections, defaultValue: any = false): PrismaSelect<SubscriptionSelect> => {
    if (!selections || isEmpty(selections)) return defaultValue;
    return toPrismaSelect<SubscriptionSelect>(selections);
};

export const subscriptionObjectTypeDefs = gql`
    type SubscriptionObject {
        id: ID
        amount: Int
        currentPeriodEnd: Date
        currentPeriodStart: Date
        name: String
        remainingUnit: Int
        type: String
        unit: Int
    }
`;

export const subscriptionObjectResolvers = {};
