import { IFieldResolver } from "@graphql-tools/utils";
import { Log } from "@utils/logger";
import { gql } from "apollo-server-core";
import { differenceWith } from "lodash";
import { GqlError } from "src/functions/graphql/error";
import { Context } from "../../context";
import { Result } from "../core/result";

type LinkSpaceToCancelPoliciesArgs = { spaceId: string; cancelPolicyIds: string[] };

type LinkSpaceToCancelPoliciesResult = Promise<Result>;

type LinkSpaceToCancelPolicies = IFieldResolver<
    any,
    Context,
    LinkSpaceToCancelPoliciesArgs,
    LinkSpaceToCancelPoliciesResult
>;

const linkSpaceToCancelPolicies: LinkSpaceToCancelPolicies = async (
    _,
    { cancelPolicyIds, spaceId },
    { authData, store }
) => {
    const { accountId } = authData;

    const space = await store.space.findUnique({ where: { id: spaceId }, select: { accountId: true } });

    if (!space) throw new GqlError({ code: "NOT_FOUND", message: "Space not found" });

    if (accountId !== space.accountId)
        throw new GqlError({ code: "UNAUTHORIZED", message: "You are not authorized to modify this space" });

    const cancelPolices = await store.cancelPolicy.findMany({ where: { id: { in: cancelPolicyIds } } });

    differenceWith(cancelPolicyIds, cancelPolices, (a, b) => a === b.id).forEach((id) => {
        throw new GqlError({ code: "BAD_USER_INPUT", message: `Cancel policy with id ${id} not found` });
    });

    const updateSpace = await Promise.all(
        cancelPolicyIds.map((id) =>
            store.space.update({
                where: { id: spaceId },
                data: { cancelPolicies: { connect: { id: id } } },
            })
        )
    );

    Log("linkSpaceToCancelPolicies", updateSpace);

    return { message: `Linked space to cancel policies` };
};

export const linkSpaceToCancelPoliciesTypeDefs = gql`
    type Mutation {
        linkSpaceToCancelPolicies(spaceId: ID!, cancelPolicyIds: [ID!]!): Result @auth(requires: [host])
    }
`;

export const linkSpaceToCancelPoliciesResolvers = { Mutation: { linkSpaceToCancelPolicies } };
