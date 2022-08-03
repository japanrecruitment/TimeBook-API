import { mergeResolvers, mergeTypeDefs } from "@graphql-tools/merge";
import { addOptionPriceOverrideResolvers, addOptionPriceOverrideTypeDefs } from "./addOptionPriceOverride";
import { optionPriceOverrideByIdResolvers, optionPriceOverrideByIdTypeDefs } from "./optionPriceOverrideById";
import { optionPriceOverrideObjectResolvers, optionPriceOverrideObjectTypeDefs } from "./OptionPriceOverrideObject";
import { removeOptionPriceOverrideResolvers, removeOptionPriceOverrideTypeDefs } from "./removeOptionPriceOverride";
import { updateOptionPriceOverrideResolvers, updateOptionPriceOverrideTypeDefs } from "./updateOptionPriceOverride";

export const optionPriceOverrideTypedefs = mergeTypeDefs([
    addOptionPriceOverrideTypeDefs,
    optionPriceOverrideByIdTypeDefs,
    optionPriceOverrideObjectTypeDefs,
    removeOptionPriceOverrideTypeDefs,
    updateOptionPriceOverrideTypeDefs,
]);

export const optionPriceOverrideResolvers = mergeResolvers([
    addOptionPriceOverrideResolvers,
    optionPriceOverrideByIdResolvers,
    optionPriceOverrideObjectResolvers,
    removeOptionPriceOverrideResolvers,
    updateOptionPriceOverrideResolvers,
]);

export * from "./OptionPriceOverrideObject";
