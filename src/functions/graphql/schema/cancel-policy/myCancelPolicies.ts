import { IFieldResolver } from "@graphql-tools/utils";
import { Log } from "@utils/logger";
import { gql } from "apollo-server-core";
import { mapSelections } from "graphql-map-selections";
import { Context } from "../../context";
import { CancelPolicyObject, toCancelPolicySelect } from "./CancelPolicyObject";

type MyCancelPoliciesArgs = { hotelId?: string; spaceId?: string };

type MyCancelPoliciesResult = CancelPolicyObject[];

type MyCancelPolicies = IFieldResolver<any, Context, MyCancelPoliciesArgs, Promise<MyCancelPoliciesResult>>;

const myCancelPolicies: MyCancelPolicies = async (_, { hotelId, spaceId }, { authData, store }, info) => {
    const { accountId } = authData;

    const cancelPolicySelect = toCancelPolicySelect(mapSelections(info))?.select;
    const cancelPolices = await store.cancelPolicy.findMany({
        where: {
            accountId,
            hotels: hotelId ? { some: { id: hotelId } } : undefined,
            spaces: spaceId ? { some: { id: spaceId } } : undefined,
        },
        select: cancelPolicySelect,
    });

    Log("myCancelPolicies", cancelPolices);

    return cancelPolices;
};

export const myCancelPoliciesTypeDefs = gql`
    type Query {
        myCancelPolicies(hotelId: ID, spaceId: ID): [CancelPolicyObject] @auth(requires: [host])
    }
`;

export const myCancelPoliciesResolvers = { Query: { myCancelPolicies } };
