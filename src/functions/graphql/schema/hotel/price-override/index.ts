import { mergeResolvers, mergeTypeDefs } from "@graphql-tools/merge";
import { addPriceOverrideResolvers, addPriceOverrideTypeDefs } from "./addPriceOverride";
import {
    addPriceOverrideInHotelRoomResolvers,
    addPriceOverrideInHotelRoomTypeDefs,
} from "./addPriceOverrideInHotelRoom";
import { addPriceOverrideInRoomPlanResolvers, addPriceOverrideInRoomPlanTypeDefs } from "./addPriceOverrideInRoomPlan";
import { priceOverrideObjectResolvers, priceOverrideObjectTypeDefs } from "./PriceOverrideObject";
import {
    priceOverridesByHotelRoomIdResolvers,
    priceOverridesByHotelRoomIdTypeDefs,
} from "./priceOverridesByHotelRoomId";
import { priceOverridesByRoomPlanIdResolvers, priceOverridesByRoomPlanIdTypeDefs } from "./priceOverridesByRoomPlanId";
import {
    removePriceOverrideFromHotelRoomResolvers,
    removePriceOverrideFromHotelRoomTypeDefs,
} from "./removePriceOverrideFromHotelRoom";
import {
    removePriceOverrideFromRoomPlanResolvers,
    removePriceOverrideFromRoomPlanTypeDefs,
} from "./removePriceOverrideFromRoomPlan";
import { updatePriceOverrideResolvers, updatePriceOverrideTypeDefs } from "./updatePriceOverride";
import {
    updatePriceOverrideInHotelRoomResolvers,
    updatePriceOverrideInHotelRoomTypeDefs,
} from "./updatePriceOverrideInHotelRoom";
import {
    updatePriceOverrideInRoomPlanResolvers,
    updatePriceOverrideInRoomPlanTypeDefs,
} from "./updatePriceOverrideInRoomPlan";

export const priceOverrideTypeDefs = mergeTypeDefs([
    addPriceOverrideTypeDefs,
    addPriceOverrideInHotelRoomTypeDefs,
    addPriceOverrideInRoomPlanTypeDefs,
    priceOverridesByHotelRoomIdTypeDefs,
    priceOverridesByRoomPlanIdTypeDefs,
    priceOverrideObjectTypeDefs,
    removePriceOverrideFromHotelRoomTypeDefs,
    removePriceOverrideFromRoomPlanTypeDefs,
    updatePriceOverrideTypeDefs,
    updatePriceOverrideInHotelRoomTypeDefs,
    updatePriceOverrideInRoomPlanTypeDefs,
]);

export const priceOverrideResolvers = mergeResolvers([
    addPriceOverrideResolvers,
    addPriceOverrideInHotelRoomResolvers,
    addPriceOverrideInRoomPlanResolvers,
    priceOverridesByHotelRoomIdResolvers,
    priceOverridesByRoomPlanIdResolvers,
    priceOverrideObjectResolvers,
    removePriceOverrideFromHotelRoomResolvers,
    removePriceOverrideFromRoomPlanResolvers,
    updatePriceOverrideResolvers,
    updatePriceOverrideInHotelRoomResolvers,
    updatePriceOverrideInRoomPlanResolvers,
]);

export * from "./PriceOverrideObject";
export * from "./addPriceOverride";
export * from "./updatePriceOverride";
