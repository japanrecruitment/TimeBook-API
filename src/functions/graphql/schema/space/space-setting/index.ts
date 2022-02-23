import { mergeResolvers, mergeTypeDefs } from "@graphql-tools/merge";
import { addDefaultSpaceSettingResolvers, addDefaultSpaceSettingTypeDefs } from "./addDefaultSpaceSetting";
import { overrideSpaceSettingResolvers, overrideSpaceSettingTypeDefs } from "./overrideSpaceSetting";
import { spaceSettingFilterOptionsTypeDefs } from "./SpaceSettingFilterOptions";
import { spaceSettingObjectTypeDefs } from "./SpaceSettingObject";
import { spaceSettingsBySpaceIdResolvers, spaceSettingsBySpaceIdTypeDefs } from "./spaceSettingsBySpaceId";
import { updateSpaceSettingResolvers, updateSpaceSettingTypeDefs } from "./updateSpaceSetting";

export const spaceSettingTypeDefs = mergeTypeDefs([
    addDefaultSpaceSettingTypeDefs,
    overrideSpaceSettingTypeDefs,
    spaceSettingFilterOptionsTypeDefs,
    spaceSettingObjectTypeDefs,
    spaceSettingsBySpaceIdTypeDefs,
    updateSpaceSettingTypeDefs,
]);

export const spaceSettingResolvers = mergeResolvers([
    addDefaultSpaceSettingResolvers,
    overrideSpaceSettingResolvers,
    spaceSettingsBySpaceIdResolvers,
    updateSpaceSettingResolvers,
]);

export * from "./SpaceSettingFilterOptions";
export * from "./SpaceSettingObject";
