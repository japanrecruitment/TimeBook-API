import { mergeResolvers, mergeTypeDefs } from "@graphql-tools/merge";
import { nearestStationObjectTypeDefs } from "./NearestStationObject";
import { addNearestStationResolvers, addNearestStationTypeDefs } from "./addNearestStation";
import { removeNearestStationResolvers, removeNearestStationTypeDefs } from "./removeNearestStation";
import { updateNearestStationResolvers, updateNearestStationTypeDefs } from "./updateNearestStaion";

export const nearestStationTypeDefs = mergeTypeDefs([
    nearestStationObjectTypeDefs,
    addNearestStationTypeDefs,
    removeNearestStationTypeDefs,
    updateNearestStationTypeDefs,
]);

export const nearestStationResolvers = mergeResolvers([
    addNearestStationResolvers,
    removeNearestStationResolvers,
    updateNearestStationResolvers,
]);

export * from "./NearestStationObject";
