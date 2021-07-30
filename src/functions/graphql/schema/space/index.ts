import { mergeResolvers, mergeTypeDefs } from "@graphql-tools/merge";
import { addSpaceResolvers, addSpaceTypeDefs } from "./addSpace";
import { allSpacesTypeDefs, allSpacesResolvers } from "./allSpaces";
import { mySpacesResolvers, mySpacesTypeDefs } from "./mySpaces";
import { nearestStationTypeDefs } from "./nearestStation";
import { spacePricePlanTypeDefs } from "./spacePricePlan";
import { updateMySpaceResolvers, updateMySpaceTypeDefs } from "./updateMySpace";

export const spaceTypeDefs = mergeTypeDefs([
    addSpaceTypeDefs,
    allSpacesTypeDefs,
    mySpacesTypeDefs,
    nearestStationTypeDefs,
    spacePricePlanTypeDefs,
    updateMySpaceTypeDefs,
]);

export const spaceResolvers = mergeResolvers([
    addSpaceResolvers,
    allSpacesResolvers,
    mySpacesResolvers,
    updateMySpaceResolvers,
]);
