import { IFieldResolver } from "@graphql-tools/utils";
import { Log } from "@utils/logger";
import { gql } from "apollo-server-core";
import { differenceWith } from "lodash";
import { GqlError } from "src/functions/graphql/error";
import { Context } from "../../../context";
import { Result } from "../../core/result";

type LinkPackagePlanToCancelPoliciesArgs = { packagePlanId: string; cancelPolicyIds: string[] };

type LinkPackagePlanToCancelPoliciesResult = Promise<Result>;

type LinkPackagePlanToCancelPolicies = IFieldResolver<
    any,
    Context,
    LinkPackagePlanToCancelPoliciesArgs,
    LinkPackagePlanToCancelPoliciesResult
>;

const linkPackagePlanToCancelPolicies: LinkPackagePlanToCancelPolicies = async (
    _,
    { packagePlanId, cancelPolicyIds },
    { authData, store }
) => {
    const { accountId } = authData;

    const packagePlan = await store.packagePlan.findUnique({
        where: { id: packagePlanId },
        select: { hotel: { select: { accountId: true } } },
    });

    if (!packagePlan) throw new GqlError({ code: "NOT_FOUND", message: "Package plan not found" });

    if (accountId !== packagePlan.hotel.accountId)
        throw new GqlError({ code: "UNAUTHORIZED", message: "You are not authorized to modify this package plan" });

    const cancelPolices = await store.cancelPolicy.findMany({ where: { id: { in: cancelPolicyIds } } });

    differenceWith(cancelPolicyIds, cancelPolices, (a, b) => a === b.id).forEach((id) => {
        throw new GqlError({ code: "BAD_USER_INPUT", message: `Cancel policy with id ${id} not found` });
    });

    const updatePackagePlan = await Promise.all(
        cancelPolicyIds.map((id) =>
            store.packagePlan.update({
                where: { id: packagePlanId },
                data: { cancelPolicies: { connect: { id: id } } },
            })
        )
    );

    Log("linkPackagePlanToCancelPolicies", updatePackagePlan);

    return { message: `Linked plan to cancel policies` };
};

export const linkPackagePlanToCancelPoliciesTypeDefs = gql`
    type Mutation {
        linkPackagePlanToCancelPolicies(packagePlanId: ID!, cancelPolicyIds: [ID!]!): Result @auth(requires: [host])
    }
`;

export const linkPackagePlanToCancelPoliciesResolvers = { Mutation: { linkPackagePlanToCancelPolicies } };
