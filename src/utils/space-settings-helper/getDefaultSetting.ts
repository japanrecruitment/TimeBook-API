import { SpaceSetting } from "@prisma/client";

export const getDefaultSetting = (settings: SpaceSetting[]): SpaceSetting => {
    return settings.filter(({ isDefault }) => isDefault)[0];
};
