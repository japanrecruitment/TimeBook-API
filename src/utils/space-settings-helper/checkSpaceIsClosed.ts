import { SpaceSetting } from "@prisma/client";

export const checkSpaceIsClosed = (spaceSettings: SpaceSetting[]) => {
    const closedSpaceSetting = spaceSettings.filter(({ closed }) => closed);
    return closedSpaceSetting.length > 0 ? true : false;
};
