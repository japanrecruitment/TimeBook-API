import { IFieldResolver } from "@graphql-tools/utils";
import { Log } from "@utils/logger";
import { gql } from "apollo-server-core";
import { mapSelections } from "graphql-map-selections";
import { Context } from "../../context";
import { CancelPolicyObject, toCancelPolicySelect } from "./CancelPolicyObject";

type MyCancelPoliciesResult = CancelPolicyObject[];

type MyCancelPolicies = IFieldResolver<any, Context, any, Promise<MyCancelPoliciesResult>>;

const myCancelPolicies: MyCancelPolicies = async (_, __, { authData, store }, info) => {
    const { accountId } = authData;

    const cancelPolicySelect = toCancelPolicySelect(mapSelections(info))?.select;
    const cancelPolices = await store.cancelPolicy.findMany({
        where: { accountId },
        select: cancelPolicySelect,
    });

    Log("myCancelPolicies", cancelPolices);

    return cancelPolices;
};

export const myCancelPoliciesTypeDefs = gql`
    type Query {
        myCancelPolicies: [CancelPolicyObject] @auth(requires: [host])
    }
`;

export const myCancelPoliciesResolvers = { Query: { myCancelPolicies } };
