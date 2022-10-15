import { CancelPolicy, CancelPolicyRate } from "@prisma/client";
import { gql } from "apollo-server-core";
import { PrismaSelect, toPrismaSelect } from "graphql-map-selections";
import { isEmpty, omit } from "lodash";

type CancelPolicyRateObject = Partial<CancelPolicyRate>;

type CancelPolicyRateSelect = {
    id: boolean;
    beforeHours: boolean;
    percentage: boolean;
    createdAt: boolean;
    updatedAt: boolean;
};

const toCancelPolicyRateSelect = (selections, defaultValue: any = false): PrismaSelect<CancelPolicyRateSelect> => {
    return toPrismaSelect(selections, defaultValue);
};

export type CancelPolicyObject = Partial<CancelPolicy> & {
    rates?: CancelPolicyRateObject[];
};

export type CancelPolicySelect = {
    id: boolean;
    name: boolean;
    description: boolean;
    rates: PrismaSelect<CancelPolicyRateSelect>;
    createdAt: boolean;
    updatedAt: boolean;
};

export const toCancelPolicySelect = (selections, defaultValue: any = false): PrismaSelect<CancelPolicySelect> => {
    if (!selections || isEmpty(selections)) return defaultValue;
    const cancelPolicyRateSelect = toCancelPolicyRateSelect(selections.rates);
    const cancelPolicySelect = omit(selections, "rates");

    return {
        select: {
            ...cancelPolicySelect,
            rates: cancelPolicyRateSelect,
        } as CancelPolicySelect,
    };
};

export const cancelPolicyObjectTypeDefs = gql`
    type CancelPolicyRateObject {
        beforeHours: Float
        percentage: Float
    }

    type CancelPolicyObject {
        id: ID
        name: String
        description: String
        rates: [CancelPolicyRateObject]
        createdAt: Date
        updatedAt: Date
    }
`;

export const cancelPolicyObjectResolvers = {};
