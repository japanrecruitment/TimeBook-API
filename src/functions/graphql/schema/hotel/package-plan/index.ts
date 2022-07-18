import { mergeResolvers, mergeTypeDefs } from "@graphql-tools/merge";
import { addPackagePlanResolvers, addPackagePlanTypeDefs } from "./addPackagePlan";
import { addPackagePlanPhotosResolvers, addPackagePlanPhotosTypeDefs } from "./addPackagePlanPhotos";
import { addRoomTypesInPackagePlanResolvers, addRoomTypesInPackagePlanTypeDefs } from "./addRoomTypesInPackagePlan";
import { myPackagePlansResolvers, myPackagePlansTypeDefs } from "./myPackagePlans";
import { packagePlanByIdResolvers, packagePlanByIdTypeDefs } from "./packagePlanById";
import { packagePlanObjectResolvers, packagePlanObjectTypeDefs } from "./PackagePlanObject";
import { packagePlanRoomTypeObjectResolvers, packagePlanRoomTypeObjectTypeDefs } from "./PackagePlanRoomTypeObject";
import { removePackagePlanPhotoResolvers, removePackagePlanPhotoTypeDefs } from "./removePackagePlanPhoto";
import { updatePackagePlanResolvers, updatePackagePlanTypeDefs } from "./updatePackagePlan";

export const packagePlanTypeDefs = mergeTypeDefs([
    addPackagePlanTypeDefs,
    addPackagePlanPhotosTypeDefs,
    addRoomTypesInPackagePlanTypeDefs,
    myPackagePlansTypeDefs,
    packagePlanByIdTypeDefs,
    packagePlanObjectTypeDefs,
    packagePlanRoomTypeObjectTypeDefs,
    removePackagePlanPhotoTypeDefs,
    updatePackagePlanTypeDefs,
]);

export const packagePlanReslovers = mergeResolvers([
    addPackagePlanResolvers,
    addPackagePlanPhotosResolvers,
    addRoomTypesInPackagePlanResolvers,
    myPackagePlansResolvers,
    packagePlanByIdResolvers,
    packagePlanObjectResolvers,
    packagePlanRoomTypeObjectResolvers,
    removePackagePlanPhotoResolvers,
    updatePackagePlanResolvers,
]);

export * from "./PackagePlanObject";
