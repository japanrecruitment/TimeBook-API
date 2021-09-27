import { mergeResolvers, mergeTypeDefs } from "@graphql-tools/merge";
import { nearestStationObjectTypeDefs } from "./NearestStationObject";
import { addNearestStationsResolvers, addNearestStationsTypeDefs } from "./addNearestStation";
import { removeNearestStationResolvers, removeNearestStationTypeDefs } from "./removeNearestStation";
import { updateNearestStationResolvers, updateNearestStationTypeDefs } from "./updateNearestStaion";

export const nearestStationTypeDefs = mergeTypeDefs([
    nearestStationObjectTypeDefs,
    addNearestStationsTypeDefs,
    removeNearestStationTypeDefs,
    updateNearestStationTypeDefs,
]);

export const nearestStationResolvers = mergeResolvers([
    addNearestStationsResolvers,
    removeNearestStationResolvers,
    updateNearestStationResolvers,
]);

export * from "./NearestStationObject";
