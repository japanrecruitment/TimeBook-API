import { mergeResolvers, mergeTypeDefs } from "@graphql-tools/merge";
import { addCancelPoliciesResolvers, addCancelPoliciesTypeDefs } from "./addCancelPolicies";
import { cancelPolicyObjectTypeDefs } from "./CancelPolicyObject";
import { myCancelPoliciesResolvers, myCancelPoliciesTypeDefs } from "./myCancelPolicies";
import { removeCancelPolicyResolvers, removeCancelPolicyTypeDefs } from "./removeCancelPolicy";
import { updateCancelPolicyResolvers, updateCancelPolicyTypeDefs } from "./updateCancelPolicy";

export const typeDefs = mergeTypeDefs([
    addCancelPoliciesTypeDefs,
    cancelPolicyObjectTypeDefs,
    myCancelPoliciesTypeDefs,
    removeCancelPolicyTypeDefs,
    updateCancelPolicyTypeDefs,
]);

export const resolvers = mergeResolvers([
    addCancelPoliciesResolvers,
    myCancelPoliciesResolvers,
    removeCancelPolicyResolvers,
    updateCancelPolicyResolvers,
]);
