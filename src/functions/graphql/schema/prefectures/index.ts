import { mergeResolvers, mergeTypeDefs } from "@graphql-tools/merge";
import { allPrefecturesResolvers, allPrefecturesTypeDefs } from "./allPrefectures";
import { prefectureByIdResolvers, prefectureByIdTypeDefs } from "./prefectureById";
import { availablePrefecturesResolvers, availablePrefecturesTypeDefs } from "./availablePrefectures";
import { updatePrefectureResolvers, updatePrefectureTypeDefs } from "./updatePrefecture";

export const prefectureTypeDefs = mergeTypeDefs([
    availablePrefecturesTypeDefs,
    allPrefecturesTypeDefs,
    updatePrefectureTypeDefs,
    prefectureByIdTypeDefs,
]);

export const prefectureResolvers = mergeResolvers([
    availablePrefecturesResolvers,
    allPrefecturesResolvers,
    updatePrefectureResolvers,
    prefectureByIdResolvers,
]);
