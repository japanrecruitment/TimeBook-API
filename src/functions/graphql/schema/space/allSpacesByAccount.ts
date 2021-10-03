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

type AllSpacesByAccountArgs = {
    accountId: string;
    paginate: PaginationOption;
};

type AllSpacesByAccountResult = Promise<PaginationResult<SpaceObject>>;

type AllSpacesByAccount = IFieldResolver<any, Context, AllSpacesByAccountArgs, AllSpacesByAccountResult>;

const allSpacesByAccount: AllSpacesByAccount = async (_, { accountId, paginate }, { store }, info) => {
    const { take, skip } = paginate || {};

    const allSpaces = await store.space.findMany({
        where: { isDeleted: false, accountId },
        ...toSpaceSelect(mapSelections(info)),
        take: take && take + 1,
        skip,
    });

    Log(allSpaces);

    return createPaginationResult(allSpaces, take, skip);
};

export const allSpacesByAccountTypeDefs = gql`
    ${createPaginationResultType("AllSpaceByAccountResult", "SpaceObject")}

    type Query {
        allSpacesByAccount(accountId: ID!, paginate: PaginationOption): AllSpaceByAccountResult @auth(requires: [admin])
    }
`;

export const allSpacesByAccountResolvers = {
    Query: { allSpacesByAccount },
};
