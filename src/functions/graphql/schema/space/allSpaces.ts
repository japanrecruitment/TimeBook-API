import { IFieldResolver } from "@graphql-tools/utils";
import { Log } from "@utils/logger";
import { gql } from "apollo-server-core";
import { mapSelections } from "graphql-map-selections";
import { Context } from "../../context";
import {
    createPaginationResult,
    createPaginationResultType,
    PaginationOption,
    PaginationResult,
} from "../core/pagination";
import { SpaceObject, toSpaceSelect } from "./SpaceObject";

type AllSpaceArgs = {
    paginate: PaginationOption;
};

type AllSpaceResult = Promise<PaginationResult<SpaceObject>>;

type AllSpaces = IFieldResolver<any, Context, AllSpaceArgs, AllSpaceResult>;

const allSpaces: AllSpaces = async (_, { paginate }, { store }, info) => {
    const { take, skip } = paginate || {};

    const allSpaces = await store.space.findMany({
        where: { isDeleted: false },
        ...toSpaceSelect(mapSelections(info).spaces),
        take: take && take + 1,
        skip,
    });

    Log(allSpaces);

    return createPaginationResult(allSpaces, take, skip);
};

export const allSpacesTypeDefs = gql`
    ${createPaginationResultType("AllSpaceResult", "SpaceObject")}

    type Query {
        allSpaces(paginate: PaginationOption): AllSpaceResult
    }
`;

export const allSpacesResolvers = {
    Query: { allSpaces },
};
