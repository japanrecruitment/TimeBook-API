import { mergeResolvers, mergeTypeDefs } from "@graphql-tools/merge";
import { addStockOverrideResolvers, addStockOverrideTypeDefs } from "./addStockOverride";
import {
    addStockOverrideInHotelRoomResolvers,
    addStockOverrideInHotelRoomTypeDefs,
} from "./addStockOverrideInHotelRoom";
import { addStockOverrideInOptionResolvers, addStockOverrideInOptionTypeDefs } from "./addStockOverrideInOption";
import {
    addStockOverrideInPackagePlanResolvers,
    addStockOverrideInPackagePlanTypeDefs,
} from "./addStockOverrideInPackagePlan";
import {
    removeStockOverrideFromHotelRoomResolvers,
    removeStockOverrideFromHotelRoomTypeDefs,
} from "./removeStockOverrideFromHotelRoom";
import {
    removeStockOverrideFromOptionResolvers,
    removeStockOverrideFromOptionTypeDefs,
} from "./removeStockOverrideFromOption";
import {
    removeStockOverrideFromPackagePlanResolvers,
    removeStockOverrideFromPackagePlanTypeDefs,
} from "./removeStockOverrideFromPackagePlan";
import { stockOverrideObjectResolvers, stockOverrideObjectTypeDefs } from "./StockOverrideObject";
import {
    stockOverridesByHotelRoomIdResolvers,
    stockOverridesByHotelRoomIdTypeDefs,
} from "./stockOverridesByHotelRoomId";
import { stockOverridesByOptionIdResolvers, stockOverridesByOptionIdTypeDefs } from "./stockOverridesByOptionId";
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
    updateStockOverrideInOptionResolvers,
    updateStockOverrideInOptionTypeDefs,
} from "./updateStockOverrideInOption";
import {
    updateStockOverrideInPackagePlanResolvers,
    updateStockOverrideInPackagePlanTypeDefs,
} from "./updateStockOverrideInPackagePlan";

export const typeDefs = mergeTypeDefs([
    addStockOverrideTypeDefs,
    addStockOverrideInHotelRoomTypeDefs,
    addStockOverrideInOptionTypeDefs,
    addStockOverrideInPackagePlanTypeDefs,
    removeStockOverrideFromHotelRoomTypeDefs,
    removeStockOverrideFromOptionTypeDefs,
    removeStockOverrideFromPackagePlanTypeDefs,
    stockOverrideObjectTypeDefs,
    stockOverridesByHotelRoomIdTypeDefs,
    stockOverridesByOptionIdTypeDefs,
    stockOverridesByPackagePlanIdTypeDefs,
    updateStockOverrideTypeDefs,
    updateStockOverrideInHotelRoomTypeDefs,
    updateStockOverrideInOptionTypeDefs,
    updateStockOverrideInPackagePlanTypeDefs,
]);

export const resolvers = mergeResolvers([
    addStockOverrideResolvers,
    addStockOverrideInHotelRoomResolvers,
    addStockOverrideInOptionResolvers,
    addStockOverrideInPackagePlanResolvers,
    removeStockOverrideFromHotelRoomResolvers,
    removeStockOverrideFromOptionResolvers,
    removeStockOverrideFromPackagePlanResolvers,
    stockOverrideObjectResolvers,
    stockOverridesByHotelRoomIdResolvers,
    stockOverridesByOptionIdResolvers,
    stockOverridesByPackagePlanIdResolvers,
    updateStockOverrideInHotelRoomResolvers,
    updateStockOverrideInOptionResolvers,
    updateStockOverrideInPackagePlanResolvers,
]);

export * from "./StockOverrideObject";
export * from "./addStockOverride";
export * from "./updateStockOverride";
