import { mergeResolvers, mergeTypeDefs } from "@graphql-tools/merge";
import { allPrefecturesResolvers, allPrefecturesTypeDefs } from "./allPrefectures";
import { prefectureByIdResolvers, prefectureByIdTypeDefs } from "./prefectureById";
import { prefecturesResolvers, prefecturesTypeDefs } from "./prefectures";
import { updatePrefectureResolvers, updatePrefectureTypeDefs } from "./updatePrefecture";

export const prefectureTypeDefs = mergeTypeDefs([
    prefecturesTypeDefs,
    allPrefecturesTypeDefs,
    updatePrefectureTypeDefs,
    prefectureByIdTypeDefs,
]);

export const prefectureResolvers = mergeResolvers([
    prefecturesResolvers,
    allPrefecturesResolvers,
    updatePrefectureResolvers,
    prefectureByIdResolvers,
]);
