import { mergeResolvers, mergeTypeDefs } from "@graphql-tools/merge";
import { addCancelPoliciesResolvers, addCancelPoliciesTypeDefs } from "./addCancelPolicies";
import { cancelPolicyObjectTypeDefs } from "./CancelPolicyObject";
import { removeCancelPolicyResolvers, removeCancelPolicyTypeDefs } from "./removeCancelPolicy";
import { updateCancelPolicyResolvers, updateCancelPolicyTypeDefs } from "./updateCancelPolicy";

export const typeDefs = mergeTypeDefs([
    cancelPolicyObjectTypeDefs,
    addCancelPoliciesTypeDefs,
    removeCancelPolicyTypeDefs,
    updateCancelPolicyTypeDefs,
]);

export const resolvers = mergeResolvers([
    addCancelPoliciesResolvers,
    removeCancelPolicyResolvers,
    updateCancelPolicyResolvers,
]);
