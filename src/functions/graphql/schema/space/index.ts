import { mergeResolvers, mergeTypeDefs } from "@graphql-tools/merge";
import { addSpaceResolvers, addSpaceTypeDefs } from "./addSpace";
import { mySpacesResolvers, mySpacesTypeDefs } from "./mySpaces";
import { nearestStationResolvers, nearestStationTypeDefs } from "./nearest-stations";
import { spaceByIdResolvers, spaceByIdTypeDefs } from "./spaceById";
import { spacePricePlanTypeDefs, spacePricePlanResolvers } from "./space-price-plans";
import { updateMySpaceResolvers, updateMySpaceTypeDefs } from "./updateMySpace";
import { spaceTypesResolvers, spaceTypesTypeDefs } from "./space-types";
import { spaceObjectResolvers, spaceObjectTypeDefs } from "./SpaceObject";
import { spaceAddressResolvers, spaceAddressTypeDefs } from "./space-address";
import { removeSpaceResolvers, removeSpaceTypeDefs } from "./removeSpace";
import { suspendSpaceResolvers, suspendSpaceTypeDefs } from "./suspendSpace";
import { addSpacePhotosResolvers, addSpacePhotosTypeDefs } from "./addSpacePhotos";
import { availableSpacesByAccountResolvers, availableSpacesByAccountTypeDefs } from "./availableSpacesByAccount";
import { allSpacesByAccountResolvers, allSpacesByAccountTypeDefs } from "./allSpacesByAccount";
import { allSpacesResolvers, allSpacesTypeDefs } from "./allSpaces";
import { updateTypesInSpaceResolvers, updateTypesInSpaceTypeDefs } from "./updateTypesInSpace";
import { spaceAmenitiesResolvers, spaceAmenitiesTypeDefs } from "./space-amenities";
import { spaceSettingResolvers, spaceSettingTypeDefs } from "./space-setting";
import { publishSpaceResolvers, publishSpaceTypeDefs } from "./publishSpace";
import { ratingResolvers, ratingsTypeDefs } from "./ratings";

export const spaceTypeDefs = mergeTypeDefs([
    spaceObjectTypeDefs,
    addSpaceTypeDefs,
    mySpacesTypeDefs,
    nearestStationTypeDefs,
    spaceByIdTypeDefs,
    spacePricePlanTypeDefs,
    spaceTypesTypeDefs,
    updateMySpaceTypeDefs,
    spaceAddressTypeDefs,
    removeSpaceTypeDefs,
    suspendSpaceTypeDefs,
    addSpacePhotosTypeDefs,
    availableSpacesByAccountTypeDefs,
    allSpacesByAccountTypeDefs,
    allSpacesTypeDefs,
    updateTypesInSpaceTypeDefs,
    spaceAmenitiesTypeDefs,
    spaceSettingTypeDefs,
    publishSpaceTypeDefs,
    ratingsTypeDefs,
]);

export const spaceResolvers = mergeResolvers([
    spaceObjectResolvers,
    addSpaceResolvers,
    mySpacesResolvers,
    nearestStationResolvers,
    spaceByIdResolvers,
    spacePricePlanResolvers,
    spaceTypesResolvers,
    updateMySpaceResolvers,
    spaceAddressResolvers,
    removeSpaceResolvers,
    suspendSpaceResolvers,
    addSpacePhotosResolvers,
    availableSpacesByAccountResolvers,
    allSpacesByAccountResolvers,
    allSpacesResolvers,
    updateTypesInSpaceResolvers,
    spaceAmenitiesResolvers,
    spaceSettingResolvers,
    publishSpaceResolvers,
    ratingResolvers,
]);
