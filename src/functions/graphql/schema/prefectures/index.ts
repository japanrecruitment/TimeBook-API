import { mergeResolvers, mergeTypeDefs } from "@graphql-tools/merge";
import { allPrefecturesResolvers, allPrefecturesTypeDefs } from "./allPrefectures";
import { disablePrefectureResolvers, disablePrefectureTypeDefs } from "./disablePrefecture";
import { enablePrefectureResolvers, enablePrefectureTypeDefs } from "./enablePrefecture";
import { prefectureByIdResolvers, prefectureByIdTypeDefs } from "./prefectureById";
import { availablePrefecturesResolvers, availablePrefecturesTypeDefs } from "./availablePrefectures";
import { updatePrefectureResolvers, updatePrefectureTypeDefs } from "./updatePrefecture";

export const prefectureTypeDefs = mergeTypeDefs([
    availablePrefecturesTypeDefs,
    allPrefecturesTypeDefs,
    updatePrefectureTypeDefs,
    prefectureByIdTypeDefs,
    enablePrefectureTypeDefs,
    disablePrefectureTypeDefs,
]);

export const prefectureResolvers = mergeResolvers([
    availablePrefecturesResolvers,
    allPrefecturesResolvers,
    updatePrefectureResolvers,
    prefectureByIdResolvers,
    enablePrefectureResolvers,
    disablePrefectureResolvers,
]);
