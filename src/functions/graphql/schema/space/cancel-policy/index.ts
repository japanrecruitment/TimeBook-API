import { mergeResolvers, mergeTypeDefs } from "@graphql-tools/merge";
import { addCancelPoliciesResolvers, addCancelPoliciesTypeDefs } from "./addCancelPolicies";
import { cancelPolicyObjectTypeDefs } from "./CancelPolicyObject";
import { removeCancelPolicyResolvers, removeCancelPolicyTypeDefs } from "./removeCancelPolicy";
import { updateCancelPolicyResolvers, updateCancelPolicyTypeDefs } from "./updateCancelPolicy";

export const cancelPolicyTypeDefs = mergeTypeDefs([
    cancelPolicyObjectTypeDefs,
    addCancelPoliciesTypeDefs,
    removeCancelPolicyTypeDefs,
    updateCancelPolicyTypeDefs,
]);

export const cancelPolicyResolvers = mergeResolvers([
    addCancelPoliciesResolvers,
    removeCancelPolicyResolvers,
    updateCancelPolicyResolvers,
]);
