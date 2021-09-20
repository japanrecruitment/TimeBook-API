import { PrismaSelect } from "graphql-map-selections";
import { SpaceTypeObject, SpaceTypeSelect, toSpaceTypeSelect } from "../space-types";

export type SpaceToSpaceTypeObject = {
    spaceType: Partial<SpaceTypeObject>;
};

export type SpaceToSpaceTypeSelect = {
    spaceType: PrismaSelect<SpaceTypeSelect>;
};

export const toSpaceToSpaceTypeSelect = (selections): PrismaSelect<SpaceToSpaceTypeSelect> => {
    const spaceTypeSelect = toSpaceTypeSelect(selections);
    if (!spaceTypeSelect) return;
    return { select: { spaceType: spaceTypeSelect } };
};
