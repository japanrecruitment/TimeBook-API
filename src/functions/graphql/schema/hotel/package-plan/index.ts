import { mergeResolvers, mergeTypeDefs } from "@graphql-tools/merge";
import { addPackagePlanResolvers, addPackagePlanTypeDefs } from "./addPackagePlan";
import { addPackagePlanPhotosResolvers, addPackagePlanPhotosTypeDefs } from "./addPackagePlanPhotos";
import { addPriceOverrideInRoomPlanResolvers, addPriceOverrideInRoomPlanTypeDefs } from "./addPriceOverrideInRoomPlan";
import { addRoomTypesInPackagePlanResolvers, addRoomTypesInPackagePlanTypeDefs } from "./addRoomTypesInPackagePlan";
import { myPackagePlansResolvers, myPackagePlansTypeDefs } from "./myPackagePlans";
import { packagePlanByIdResolvers, packagePlanByIdTypeDefs } from "./packagePlanById";
import { packagePlanObjectResolvers, packagePlanObjectTypeDefs } from "./PackagePlanObject";
import { packagePlanRoomTypeObjectResolvers, packagePlanRoomTypeObjectTypeDefs } from "./PackagePlanRoomTypeObject";
import { removePackagePlanPhotoResolvers, removePackagePlanPhotoTypeDefs } from "./removePackagePlanPhoto";
import {
    removePriceOverrideFromRoomPlanResolvers,
    removePriceOverrideFromRoomPlanTypeDefs,
} from "./removePriceOverrideFromHotelRoom";
import {
    removeRoomTypesFromPackagePlanResolvers,
    removeRoomTypesFromPackagePlanTypeDefs,
} from "./removeRoomTypesFromPackagePlan";
import { updatePackagePlanResolvers, updatePackagePlanTypeDefs } from "./updatePackagePlan";
import {
    updatePriceOverrideInRoomPlanResolvers,
    updatePriceOverrideInRoomPlanTypeDefs,
} from "./updatePriceOverrideInRoomPlan";
import {
    updateRoomTypeOfPackagePlanResolvers,
    updateRoomTypeOfPackagePlanTypeDefs,
} from "./updateRoomTypeOfPackagePlan";

export const packagePlanTypeDefs = mergeTypeDefs([
    addPackagePlanTypeDefs,
    addPackagePlanPhotosTypeDefs,
    addRoomTypesInPackagePlanTypeDefs,
    addPriceOverrideInRoomPlanTypeDefs,
    myPackagePlansTypeDefs,
    packagePlanByIdTypeDefs,
    packagePlanObjectTypeDefs,
    packagePlanRoomTypeObjectTypeDefs,
    removePackagePlanPhotoTypeDefs,
    removePriceOverrideFromRoomPlanTypeDefs,
    removeRoomTypesFromPackagePlanTypeDefs,
    updatePackagePlanTypeDefs,
    updatePriceOverrideInRoomPlanTypeDefs,
    updateRoomTypeOfPackagePlanTypeDefs,
]);

export const packagePlanResolvers = mergeResolvers([
    addPackagePlanResolvers,
    addPackagePlanPhotosResolvers,
    addPriceOverrideInRoomPlanResolvers,
    addRoomTypesInPackagePlanResolvers,
    myPackagePlansResolvers,
    packagePlanByIdResolvers,
    packagePlanObjectResolvers,
    packagePlanRoomTypeObjectResolvers,
    removePackagePlanPhotoResolvers,
    removePriceOverrideFromRoomPlanResolvers,
    removeRoomTypesFromPackagePlanResolvers,
    updatePackagePlanResolvers,
    updatePriceOverrideInRoomPlanResolvers,
    updateRoomTypeOfPackagePlanResolvers,
]);

export * from "./PackagePlanObject";
