import { mergeResolvers, mergeTypeDefs } from "@graphql-tools/merge";
import { addPackagePlanResolvers, addPackagePlanTypeDefs } from "./addPackagePlan";
import { addPackagePlanPhotosResolvers, addPackagePlanPhotosTypeDefs } from "./addPackagePlanPhotos";
import { addRoomTypesInPackagePlanResolvers, addRoomTypesInPackagePlanTypeDefs } from "./addRoomTypesInPackagePlan";
import { myPackagePlansResolvers, myPackagePlansTypeDefs } from "./myPackagePlans";
import { packagePlanByIdResolvers, packagePlanByIdTypeDefs } from "./packagePlanById";
import { packagePlanObjectResolvers, packagePlanObjectTypeDefs } from "./PackagePlanObject";
import { packagePlanRoomTypeObjectResolvers, packagePlanRoomTypeObjectTypeDefs } from "./PackagePlanRoomTypeObject";
import { removePackagePlanResolvers, removePackagePlanTypeDefs } from "./removePackagePlan";
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
    myPackagePlansTypeDefs,
    packagePlanByIdTypeDefs,
    packagePlanObjectTypeDefs,
    packagePlanRoomTypeObjectTypeDefs,
    removePackagePlanTypeDefs,
    removePackagePlanPhotoTypeDefs,
    removeRoomTypesFromPackagePlanTypeDefs,
    updatePackagePlanTypeDefs,
    updateRoomTypeOfPackagePlanTypeDefs,
]);

export const packagePlanResolvers = mergeResolvers([
    addPackagePlanResolvers,
    addPackagePlanPhotosResolvers,
    addRoomTypesInPackagePlanResolvers,
    myPackagePlansResolvers,
    packagePlanByIdResolvers,
    packagePlanObjectResolvers,
    packagePlanRoomTypeObjectResolvers,
    removePackagePlanResolvers,
    removePackagePlanPhotoResolvers,
    removeRoomTypesFromPackagePlanResolvers,
    updatePackagePlanResolvers,
    updateRoomTypeOfPackagePlanResolvers,
]);

export * from "./PackagePlanObject";
