import { mergeResolvers, mergeTypeDefs } from "@graphql-tools/merge";
import { addPackagePlanResolvers, addPackagePlanTypeDefs } from "./addPackagePlan";
import { myPackagePlansResolvers, myPackagePlansTypeDefs } from "./myPackagePlans";
import { packagePlanByIdResolvers, packagePlanByIdTypeDefs } from "./packagePlanById";
import { packagePlanObjectResolvers, packagePlanObjectTypeDefs } from "./PackagePlanObject";

export const packagePlanTypeDefs = mergeTypeDefs([
    packagePlanObjectTypeDefs,
    addPackagePlanTypeDefs,
    myPackagePlansTypeDefs,
    packagePlanByIdTypeDefs,
]);

export const packagePlanReslovers = mergeResolvers([
    packagePlanObjectResolvers,
    addPackagePlanResolvers,
    myPackagePlansResolvers,
    packagePlanByIdResolvers,
]);

export * from "./PackagePlanObject";
