import { PrismaSelect } from "graphql-map-selections";
import { SpaceTypeObject, SpaceTypeSelect, toSpaceTypeSelect } from "../space-types";

export type SpaceToSpaceTypeObject = {
    spaceType: Partial<SpaceTypeObject>;
};

export type SpaceToSpaceTypeSelect = {
    spaceType: PrismaSelect<SpaceTypeSelect>;
};

export const toSpaceToSpaceTypeSelect = (
    selections,
    defaultValue: any = false
): PrismaSelect<SpaceToSpaceTypeSelect> => {
    const spaceTypeSelect = toSpaceTypeSelect(selections);
    if (!spaceTypeSelect) return defaultValue;
    return { select: { spaceType: spaceTypeSelect } };
};
