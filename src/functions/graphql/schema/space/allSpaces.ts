import { IFieldResolver } from "@graphql-tools/utils";
import { Log } from "@utils/logger";
import { gql } from "apollo-server-core";
import { mapSelections } from "graphql-map-selections";
import { Context } from "../../context";
import { PaginationInfo } from "../core/paginationInfo";
import { PaginationOption } from "../core/paginationOption";
import { SpaceObject, toSpaceSelect } from "./SpaceObject";

type AllSpaceArgs = {
    paginate: PaginationOption;
};

type AllSpaceResult = { spaces: SpaceObject[]; paginationInfo: PaginationInfo };

type AllSpaces = IFieldResolver<any, Context, AllSpaceArgs, Promise<AllSpaceResult>>;

const allSpaces: AllSpaces = async (_, { paginate }, { store }, info) => {
    const { take, skip } = paginate || {};

    const allSpaces = await store.space.findMany({
        where: { isDeleted: false },
        ...toSpaceSelect(mapSelections(info).spaces),
        take: take && take + 1,
        skip,
    });

    Log(allSpaces);

    return {
        spaces: allSpaces.slice(0, take),
        paginationInfo: {
            hasNext: take ? allSpaces.length > take : false,
            hasPrevious: skip ? skip > 0 : false,
        },
    };
};

export const allSpacesTypeDefs = gql`
    type AllSpaceResult {
        spaces: [SpaceObject]
        paginationInfo: PaginationInfo
    }

    type Query {
        allSpaces(paginate: PaginationOption): AllSpaceResult
    }
`;

export const allSpacesResolvers = {
    Query: { allSpaces },
};
