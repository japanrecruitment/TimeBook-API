import { mergeResolvers, mergeTypeDefs } from "@graphql-tools/merge";
import { addSpaceResolvers, addSpaceTypeDefs } from "./addSpace";
import { allSpacesTypeDefs, allSpacesResolvers } from "./allSpaces";
import { mySpacesResolvers, mySpacesTypeDefs } from "./mySpaces";
import { nearestStationResolvers, nearestStationTypeDefs } from "./nearest-stations";
import { spaceByIdResolvers, spaceByIdTypeDefs } from "./spaceById";
import { spacePricePlanTypeDefs } from "./spacePricePlan";
import { updateMySpaceResolvers, updateMySpaceTypeDefs } from "./updateMySpace";

export const spaceTypeDefs = mergeTypeDefs([
    addSpaceTypeDefs,
    allSpacesTypeDefs,
    mySpacesTypeDefs,
    nearestStationTypeDefs,
    spaceByIdTypeDefs,
    spacePricePlanTypeDefs,
    updateMySpaceTypeDefs,
]);

export const spaceResolvers = mergeResolvers([
    addSpaceResolvers,
    allSpacesResolvers,
    mySpacesResolvers,
    nearestStationResolvers,
    spaceByIdResolvers,
    updateMySpaceResolvers,
]);
