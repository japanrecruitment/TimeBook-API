import { mergeResolvers, mergeTypeDefs } from "@graphql-tools/merge";
import { allPrefecturesResolvers, allPrefecturesTypeDefs } from "./allPrefectures";
import { disablePrefectureResolvers, disablePrefectureTypeDefs } from "./disablePrefecture";
import { enablePrefectureResolvers, enablePrefectureTypeDefs } from "./enablePrefecture";
import { prefectureByIdResolvers, prefectureByIdTypeDefs } from "./prefectureById";
import { prefecturesResolvers, prefecturesTypeDefs } from "./prefectures";
import { updatePrefectureResolvers, updatePrefectureTypeDefs } from "./updatePrefecture";

export const prefectureTypeDefs = mergeTypeDefs([
    prefecturesTypeDefs,
    allPrefecturesTypeDefs,
    updatePrefectureTypeDefs,
    prefectureByIdTypeDefs,
    enablePrefectureTypeDefs,
    disablePrefectureTypeDefs,
]);

export const prefectureResolvers = mergeResolvers([
    prefecturesResolvers,
    allPrefecturesResolvers,
    updatePrefectureResolvers,
    prefectureByIdResolvers,
    enablePrefectureResolvers,
    disablePrefectureResolvers,
]);
