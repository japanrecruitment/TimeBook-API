import { mergeResolvers, mergeTypeDefs } from "@graphql-tools/merge";
import { addPriceOverrideResolvers, addPriceOverrideTypeDefs } from "./addPriceOverride";
import { priceOverrideObjectResolvers, priceOverrideObjectTypeDefs } from "./PriceOverrideObject";
import {
    priceOverridesByHotelRoomIdResolvers,
    priceOverridesByHotelRoomIdTypeDefs,
} from "./priceOverridesByHotelRoomId";
import { priceOverridesByRoomPlanIdResolvers, priceOverridesByRoomPlanIdTypeDefs } from "./priceOverridesByRoomPland";
import { updatePriceOverrideResolvers, updatePriceOverrideTypeDefs } from "./updatePriceOverride";

export const priceOverrideTypeDefs = mergeTypeDefs([
    addPriceOverrideTypeDefs,
    priceOverridesByHotelRoomIdTypeDefs,
    priceOverridesByRoomPlanIdTypeDefs,
    priceOverrideObjectTypeDefs,
    updatePriceOverrideTypeDefs,
]);

export const priceOverrideResolvers = mergeResolvers([
    addPriceOverrideResolvers,
    priceOverridesByHotelRoomIdResolvers,
    priceOverridesByRoomPlanIdResolvers,
    priceOverrideObjectResolvers,
    updatePriceOverrideResolvers,
]);

export * from "./PriceOverrideObject";
export * from "./addPriceOverride";
export * from "./updatePriceOverride";
