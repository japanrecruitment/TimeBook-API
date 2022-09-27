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

type MySpacesArgs = {
    paginate: PaginationOption;
};

type MySpacesResult = Promise<PaginationResult<SpaceObject>>;

type MySpaces = IFieldResolver<any, Context, MySpacesArgs, MySpacesResult>;

const mySpaces: MySpaces = async (_, { paginate }, { store, authData }, info) => {
    const { accountId } = authData;

    const { take, skip } = paginate || {};

    const mySpaces = await store.space.findMany({
        where: { accountId, isDeleted: false },
        ...toSpaceSelect(mapSelections(info)?.data),
        take: take && take + 1,
        skip,
    });

    Log(mySpaces);

    return createPaginationResult(mySpaces, take, skip);
};

export const mySpacesTypeDefs = gql`
    ${createPaginationResultType("MySpacesResult", "SpaceObject")}

    type Query {
        mySpaces(paginate: PaginationOption): MySpacesResult @auth(requires: [host])
    }
`;

export const mySpacesResolvers = {
    Query: { mySpaces },
};
