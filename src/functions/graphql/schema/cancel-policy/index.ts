import { mergeResolvers, mergeTypeDefs } from "@graphql-tools/merge";
import { addCancelPolicyResolvers, addCancelPolicyTypeDefs } from "./addCancelPolicy";
import { cancelPolicyByIdResolvers, cancelPolicyByIdTypeDefs } from "./cancelPolicyById";
import { cancelPolicyObjectResolvers, cancelPolicyObjectTypeDefs } from "./CancelPolicyObject";
import { myCancelPoliciesResolvers, myCancelPoliciesTypeDefs } from "./myCancelPolicies";
import { removeCancelPolicyResolvers, removeCancelPolicyTypeDefs } from "./removeCancelPolicy";
import { updateCancelPolicyResolvers, updateCancelPolicyTypeDefs } from "./updateCancelPolicy";

export const typeDefs = mergeTypeDefs([
    addCancelPolicyTypeDefs,
    cancelPolicyByIdTypeDefs,
    cancelPolicyObjectTypeDefs,
    myCancelPoliciesTypeDefs,
    removeCancelPolicyTypeDefs,
    updateCancelPolicyTypeDefs,
]);

export const resolvers = mergeResolvers([
    addCancelPolicyResolvers,
    cancelPolicyByIdResolvers,
    cancelPolicyObjectResolvers,
    myCancelPoliciesResolvers,
    removeCancelPolicyResolvers,
    updateCancelPolicyResolvers,
]);
