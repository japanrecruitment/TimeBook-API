import { mergeResolvers, mergeTypeDefs } from "@graphql-tools/merge";
import { addStockOverrideResolvers, addStockOverrideTypeDefs } from "./addStockOverride";
import {
    addStockOverrideInHotelRoomResolvers,
    addStockOverrideInHotelRoomTypeDefs,
} from "./addStockOverrideInHotelRoom";
import {
    addStockOverrideInPackagePlanResolvers,
    addStockOverrideInPackagePlanTypeDefs,
} from "./addStockOverrideInPackagePlan";
import {
    removeStockOverrideFromHotelRoomResolvers,
    removeStockOverrideFromHotelRoomTypeDefs,
} from "./removeStockOverrideFromHotelRoom";
import {
    removeStockOverrideFromPackagePlanResolvers,
    removeStockOverrideFromPackagePlanTypeDefs,
} from "./removeStockOverrideFromPackagePlan";
import { stockOverrideObjectResolvers, stockOverrideObjectTypeDefs } from "./StockOverrideObject";
import {
    stockOverridesByHotelRoomIdResolvers,
    stockOverridesByHotelRoomIdTypeDefs,
} from "./stockOverridesByHotelRoomId";
import {
    stockOverridesByPackagePlanIdResolvers,
    stockOverridesByPackagePlanIdTypeDefs,
} from "./stockOverridesByPackagePlanId";
import { updateStockOverrideTypeDefs } from "./updateStockOverride";
import {
    updateStockOverrideInHotelRoomResolvers,
    updateStockOverrideInHotelRoomTypeDefs,
} from "./updateStockOverrideInHotelRoom";
import {
    updateStockOverrideInPackagePlanResolvers,
    updateStockOverrideInPackagePlanTypeDefs,
} from "./updateStockOverrideInPackagePlan";

export const stockOverrideTypeDefs = mergeTypeDefs([
    addStockOverrideTypeDefs,
    addStockOverrideInHotelRoomTypeDefs,
    addStockOverrideInPackagePlanTypeDefs,
    removeStockOverrideFromHotelRoomTypeDefs,
    removeStockOverrideFromPackagePlanTypeDefs,
    stockOverrideObjectTypeDefs,
    stockOverridesByHotelRoomIdTypeDefs,
    stockOverridesByPackagePlanIdTypeDefs,
    updateStockOverrideTypeDefs,
    updateStockOverrideInHotelRoomTypeDefs,
    updateStockOverrideInPackagePlanTypeDefs,
]);

export const stockOverrideResolvers = mergeResolvers([
    addStockOverrideResolvers,
    addStockOverrideInHotelRoomResolvers,
    addStockOverrideInPackagePlanResolvers,
    removeStockOverrideFromHotelRoomResolvers,
    removeStockOverrideFromPackagePlanResolvers,
    stockOverrideObjectResolvers,
    stockOverridesByHotelRoomIdResolvers,
    stockOverridesByPackagePlanIdResolvers,
    updateStockOverrideInHotelRoomResolvers,
    updateStockOverrideInPackagePlanResolvers,
]);

export * from "./StockOverrideObject";
export * from "./addStockOverride";
export * from "./updateStockOverride";
