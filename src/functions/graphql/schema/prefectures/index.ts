import { mergeResolvers, mergeTypeDefs } from "@graphql-tools/merge";
import { allPrefecturesResolvers, allPrefecturesTypeDefs } from "./allPrefectures";
import { updatePrefectureResolvers, updatePrefectureTypeDefs } from "./updatePrefecture";

export const prefectureTypeDefs = mergeTypeDefs([allPrefecturesTypeDefs, updatePrefectureTypeDefs]);

export const prefectureResolvers = mergeResolvers([allPrefecturesResolvers, updatePrefectureResolvers]);
