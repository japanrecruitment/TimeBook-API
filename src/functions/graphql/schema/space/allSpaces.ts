import { IFieldResolver } from "@graphql-tools/utils";
import { Log } from "@utils/logger";
import { gql } from "apollo-server-core";
import { mapSelections } from "graphql-map-selections";
import { Context } from "../../context";
import { PaginationOption } from "../core/paginationOption";
import { SpaceObject, toSpaceSelect } from "./SpaceObject";

type AllSpaceArgs = {
    paginate: PaginationOption;
};

type AllSpaceResult = Promise<Array<SpaceObject>>;

type AllSpaces = IFieldResolver<any, Context, AllSpaceArgs, AllSpaceResult>;

const allSpaces: AllSpaces = async (_, { paginate }, { store }, info) => {
    const { take, skip } = paginate || {};

    const allSpaces = await store.space.findMany({
        ...toSpaceSelect(mapSelections(info)),
        take,
        skip,
    });

    const result = allSpaces.map((space) => {
        const spaceTypes = space.spaceTypes.map((spaceType) => spaceType.spaceType);
        return { ...space, spaceTypes };
    });

    Log(result);

    return result || [];
};

export const allSpacesTypeDefs = gql`
    type Query {
        allSpaces(paginate: PaginationOption): [SpaceObject]
    }
`;

export const allSpacesResolvers = {
    Query: { allSpaces },
};
