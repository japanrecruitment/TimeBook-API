import { IFieldResolver } from "@graphql-tools/utils";
import { Log } from "@utils/logger";
import { gql } from "apollo-server-core";
import { mapSelections } from "graphql-map-selections";
import { GqlError } from "src/functions/graphql/error";
import { Context } from "../../../context";
import { CancelPolicyObject, toCancelPolicySelect } from "./CancelPolicyObject";

type AddCancelPoliciesInput = {
    beforeHours: number;
    percentage: number;
};

type AddCancelPoliciesArgs = { spaceId: string; input: AddCancelPoliciesInput[] };

type AddCancelPoliciesResult = CancelPolicyObject[];

type AddCancelPolicies = IFieldResolver<any, Context, AddCancelPoliciesArgs, Promise<AddCancelPoliciesResult>>;

const addCancelPolicies: AddCancelPolicies = async (_, { spaceId, input }, { authData, store }, info) => {
    const { accountId } = authData;

    const space = await store.space.findUnique({ where: { id: spaceId }, select: { accountId: true } });

    if (!space) throw new GqlError({ code: "NOT_FOUND", message: "Space not found" });

    if (accountId !== space.accountId)
        throw new GqlError({ code: "UNAUTHORIZED", message: "You are not authorized to modify this space" });

    const updatedSpace = await store.space.update({
        where: { id: spaceId },
        data: { cancelPolicies: { createMany: { data: input } } },
        select: { cancelPolicies: toCancelPolicySelect(mapSelections(info)) },
    });

    Log("addCancelPolicies", updatedSpace);

    return updatedSpace.cancelPolicies;
};

export const addCancelPoliciesTypeDefs = gql`
    input AddCancelPoliciesInput {
        beforeHours: Float!
        percentage: Float!
    }

    type Mutation {
        addCancelPolicies(spaceId: ID!, input: [AddCancelPoliciesInput!]!): [CancelPolicyObject] @auth(requires: [host])
    }
`;

export const addCancelPoliciesResolvers = { Mutation: { addCancelPolicies } };
