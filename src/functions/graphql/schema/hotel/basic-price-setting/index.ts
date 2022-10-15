import { mergeResolvers, mergeTypeDefs } from "@graphql-tools/merge";
import { addBasicPriceSettingResolvers, addBasicPriceSettingTypeDefs } from "./addBasicPriceSetting";
import { basicPriceSettingObjectResolvers, basicPriceSettingObjectTypeDefs } from "./BasicPriceSettingObject";
import { updateBasicPriceSettingResolvers, updateBasicPriceSettingTypeDefs } from "./updateBasicPriceSetting";

export const basicPriceSettingTypeDefs = mergeTypeDefs([
    addBasicPriceSettingTypeDefs,
    basicPriceSettingObjectTypeDefs,
    updateBasicPriceSettingTypeDefs,
]);

export const basicPriceSettingResolvers = mergeResolvers([
    addBasicPriceSettingResolvers,
    basicPriceSettingObjectResolvers,
    updateBasicPriceSettingResolvers,
]);

export * from "./BasicPriceSettingObject";
export * from "./addBasicPriceSetting";
export * from "./updateBasicPriceSetting";
