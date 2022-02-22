import { mergeResolvers, mergeTypeDefs } from "@graphql-tools/merge";
import { addSpaceAmenitiesResolvers, addSpaceAmenitiesTypeDefs } from "./addSpaceAmenities";
import { allSpaceAmenitiesResolvers, allSpaceAmenitiesTypeDefs } from "./allSpaceAmenities";
import { spaceAmenititesObjectTypeDefs } from "./SpaceAmenitiesObject";
import { updateSpaceAmenitiesResolvers, updateSpaceAmenitiesTypeDefs } from "./updateSpaceAmenities";

export const spaceAmenitiesTypeDefs = mergeTypeDefs([
    addSpaceAmenitiesTypeDefs,
    allSpaceAmenitiesTypeDefs,
    spaceAmenititesObjectTypeDefs,
    updateSpaceAmenitiesTypeDefs,
]);

export const spaceAmenitiesResolvers = mergeResolvers([
    addSpaceAmenitiesResolvers,
    allSpaceAmenitiesResolvers,
    updateSpaceAmenitiesResolvers,
]);

export * from "./SpaceAmenitiesObject";
