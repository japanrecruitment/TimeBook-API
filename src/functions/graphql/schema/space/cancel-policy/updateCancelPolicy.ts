import { IFieldResolver } from "@graphql-tools/utils";
import { Log } from "@utils/logger";
import { gql } from "apollo-server-core";
import { mapSelections } from "graphql-map-selections";
import { GqlError } from "src/functions/graphql/error";
import { Context } from "../../../context";
import { CancelPolicyObject, toCancelPolicySelect } from "./CancelPolicyObject";

type UpdateCancelPolicyInput = {
    id: string;
    beforeHours?: number;
    percentage?: number;
};

type UpdateCancelPolicyArgs = { input: UpdateCancelPolicyInput };

type UpdateCancelPolicyResult = Promise<CancelPolicyObject>;

type UpdateCancelPolicy = IFieldResolver<any, Context, UpdateCancelPolicyArgs, UpdateCancelPolicyResult>;

const updateCancelPolicy: UpdateCancelPolicy = async (_, { input }, { authData, store }, info) => {
    const { accountId } = authData;

    const { id, beforeHours, percentage } = input;

    const cancelPolicy = await store.cancelPolicy.findUnique({
        where: { id },
        select: { space: { select: { accountId: true } } },
    });

    if (!cancelPolicy) throw new GqlError({ code: "NOT_FOUND", message: "Cancel policy not found" });

    if (accountId !== cancelPolicy.space.accountId)
        throw new GqlError({ code: "UNAUTHORIZED", message: "You are not authorized to modify this space" });

    const updatedCancelPolicy = await store.cancelPolicy.update({
        where: { id },
        data: { beforeHours, percentage },
        select: toCancelPolicySelect(mapSelections(info)).select,
    });

    Log("updateCancelPolicy", updatedCancelPolicy);

    return updatedCancelPolicy;
};

export const updateCancelPolicyTypeDefs = gql`
    input UpdateCancelPolicyInput {
        id: ID!
        beforeHours: Float
        percentage: Float
    }

    type Mutation {
        updateCancelPolicy(input: UpdateCancelPolicyInput!): CancelPolicyObject @auth(requires: [host])
    }
`;

export const updateCancelPolicyResolvers = { Mutation: { updateCancelPolicy } };