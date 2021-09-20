import { IFieldResolver } from "@graphql-tools/utils";
import { Log } from "@utils/logger";
import { gql } from "apollo-server-core";
import { mapSelections } from "@libs/graphql-map-selections";
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

    Log(allSpaces);

    return allSpaces || [];
};

export const allSpacesTypeDefs = gql`
    type Query {
        allSpaces(paginate: PaginationOption): [SpaceObject]
    }
`;

export const allSpacesResolvers = {
    Query: { allSpaces },
};
