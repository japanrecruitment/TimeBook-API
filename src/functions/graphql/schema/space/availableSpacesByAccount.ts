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

type AvailableSpacesByAccountArgs = {
    accountId: string;
    paginate: PaginationOption;
};

type AvailableSpacesByAccountResult = Promise<PaginationResult<SpaceObject>>;

type AvailableSpacesByAccount = IFieldResolver<
    any,
    Context,
    AvailableSpacesByAccountArgs,
    AvailableSpacesByAccountResult
>;

const availableSpacesByAccount: AvailableSpacesByAccount = async (_, { accountId, paginate }, { store }, info) => {
    const { take, skip } = paginate || {};

    const allSpaces = await store.space.findMany({
        where: { isDeleted: false, suspended: false, accountId },
        ...toSpaceSelect(mapSelections(info).data),
        take: take && take + 1,
        skip,
    });

    Log(allSpaces);

    return createPaginationResult(allSpaces, take, skip);
};

export const availableSpacesByAccountTypeDefs = gql`
    ${createPaginationResultType("AvailableSpaceByAccountResult", "SpaceObject")}

    type Query {
        availableSpacesByAccount(accountId: ID!, paginate: PaginationOption): AvailableSpaceByAccountResult
    }
`;

export const availableSpacesByAccountResolvers = {
    Query: { availableSpacesByAccount },
};
