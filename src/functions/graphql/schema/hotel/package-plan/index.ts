import { mergeResolvers, mergeTypeDefs } from "@graphql-tools/merge";
import { addPackagePlanResolvers, addPackagePlanTypeDefs } from "./addPackagePlan";
import { addPackagePlanPhotosResolvers, addPackagePlanPhotosTypeDefs } from "./addPackagePlanPhotos";
import { addRoomTypesInPackagePlanResolvers, addRoomTypesInPackagePlanTypeDefs } from "./addRoomTypesInPackagePlan";
import {
    linkPackagePlanToCancelPoliciesResolvers,
    linkPackagePlanToCancelPoliciesTypeDefs,
} from "./linkPackagePlanToCancelPolicies";
import { myPackagePlansResolvers, myPackagePlansTypeDefs } from "./myPackagePlans";
import { packagePlanByIdResolvers, packagePlanByIdTypeDefs } from "./packagePlanById";
import { packagePlanObjectResolvers, packagePlanObjectTypeDefs } from "./PackagePlanObject";
import { packagePlanRoomTypeObjectResolvers, packagePlanRoomTypeObjectTypeDefs } from "./PackagePlanRoomTypeObject";
import { removePackagePlanPhotoResolvers, removePackagePlanPhotoTypeDefs } from "./removePackagePlanPhoto";
import {
    removeRoomTypesFromPackagePlanResolvers,
    removeRoomTypesFromPackagePlanTypeDefs,
} from "./removeRoomTypesFromPackagePlan";
import { updatePackagePlanResolvers, updatePackagePlanTypeDefs } from "./updatePackagePlan";
import {
    updateRoomTypeOfPackagePlanResolvers,
    updateRoomTypeOfPackagePlanTypeDefs,
} from "./updateRoomTypeOfPackagePlan";

export const packagePlanTypeDefs = mergeTypeDefs([
    addPackagePlanTypeDefs,
    addPackagePlanPhotosTypeDefs,
    addRoomTypesInPackagePlanTypeDefs,
    linkPackagePlanToCancelPoliciesTypeDefs,
    myPackagePlansTypeDefs,
    packagePlanByIdTypeDefs,
    packagePlanObjectTypeDefs,
    packagePlanRoomTypeObjectTypeDefs,
    removePackagePlanPhotoTypeDefs,
    removeRoomTypesFromPackagePlanTypeDefs,
    updatePackagePlanTypeDefs,
    updateRoomTypeOfPackagePlanTypeDefs,
]);

export const packagePlanResolvers = mergeResolvers([
    addPackagePlanResolvers,
    addPackagePlanPhotosResolvers,
    addRoomTypesInPackagePlanResolvers,
    linkPackagePlanToCancelPoliciesResolvers,
    myPackagePlansResolvers,
    packagePlanByIdResolvers,
    packagePlanObjectResolvers,
    packagePlanRoomTypeObjectResolvers,
    removePackagePlanPhotoResolvers,
    removeRoomTypesFromPackagePlanResolvers,
    updatePackagePlanResolvers,
    updateRoomTypeOfPackagePlanResolvers,
]);

export * from "./PackagePlanObject";
