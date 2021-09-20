import { mergeResolvers, mergeTypeDefs } from "@graphql-tools/merge";
import { addSpaceResolvers, addSpaceTypeDefs } from "./addSpace";
import { allSpacesTypeDefs, allSpacesResolvers } from "./allSpaces";
import { mySpacesResolvers, mySpacesTypeDefs } from "./mySpaces";
import { nearestStationResolvers, nearestStationTypeDefs } from "./nearest-stations";
import { spaceByIdResolvers, spaceByIdTypeDefs } from "./spaceById";
import { spacePricePlanTypeDefs, spacePricePlanResolvers } from "./space-price-plans";
import { updateMySpaceResolvers, updateMySpaceTypeDefs } from "./updateMySpace";
import { spaceTypesResolvers, spaceTypesTypeDefs } from "./space-types";
import { spaceObjectResolvers, spaceObjectTypeDefs } from "./SpaceObject";
import { spaceToSpaceTypeResolvers, spaceToSpaceTypeTypeDefs } from "./space-to-space-type";
import { spaceAddressResolvers, spaceAddressTypeDefs } from "./space-address";

export const spaceTypeDefs = mergeTypeDefs([
    spaceObjectTypeDefs,
    addSpaceTypeDefs,
    allSpacesTypeDefs,
    mySpacesTypeDefs,
    nearestStationTypeDefs,
    spaceByIdTypeDefs,
    spacePricePlanTypeDefs,
    spaceTypesTypeDefs,
    updateMySpaceTypeDefs,
    spaceToSpaceTypeTypeDefs,
    spaceAddressTypeDefs,
]);

export const spaceResolvers = mergeResolvers([
    spaceObjectResolvers,
    addSpaceResolvers,
    allSpacesResolvers,
    mySpacesResolvers,
    nearestStationResolvers,
    spaceByIdResolvers,
    spacePricePlanResolvers,
    spaceTypesResolvers,
    updateMySpaceResolvers,
    spaceToSpaceTypeResolvers,
    spaceAddressResolvers,
]);
