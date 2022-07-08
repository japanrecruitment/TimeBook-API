import { mergeResolvers, mergeTypeDefs } from "@graphql-tools/merge";
import { addBasicPriceSettingResolvers, addBasicPriceSettingTypeDefs } from "./addBasicPriceSetting";
import { basicPriceSettingObjectResolvers, basicPriceSettingObjectTypeDefs } from "./BasicPriceSettingObject";

export const basicPriceSettingTypeDefs = mergeTypeDefs([addBasicPriceSettingTypeDefs, basicPriceSettingObjectTypeDefs]);

export const basicPriceSettingResolvers = mergeResolvers([
    addBasicPriceSettingResolvers,
    basicPriceSettingObjectResolvers,
]);

export * from "./BasicPriceSettingObject";
export * from "./addBasicPriceSetting";
