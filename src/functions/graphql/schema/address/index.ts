import { mergeResolvers, mergeTypeDefs } from "@graphql-tools/merge";
import { addressObjectTypeDefs } from "./AddressObject";
import { addAddressInputTypeDefs } from "./AddAddressInput";
import { updateAddressInputTypeDefs } from "./UpdateAddressInput";
import { getLatLngResolvers, getLatLngTypeDefs } from "./getLatLng";

export const addressTypeDefs = mergeTypeDefs([
    addressObjectTypeDefs,
    addAddressInputTypeDefs,
    updateAddressInputTypeDefs,
    getLatLngTypeDefs,
]);

export const addressResolvers = mergeResolvers([getLatLngResolvers]);

export * from "./AddressObject";
export * from "./AddAddressInput";
export * from "./UpdateAddressInput";
