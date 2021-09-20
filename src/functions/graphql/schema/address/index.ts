import { mergeTypeDefs } from "@graphql-tools/merge";
import { addressObjectTypeDefs } from "./AddressObject";
import { addAddressInputTypeDefs } from "./AddAddressInput";
import { updateAddressInputTypeDefs } from "./UpdateAddressInput";

export const addressTypeDefs = mergeTypeDefs([
    addressObjectTypeDefs,
    addAddressInputTypeDefs,
    updateAddressInputTypeDefs,
]);

export * from "./AddressObject";
export * from "./AddAddressInput";
export * from "./UpdateAddressInput";
