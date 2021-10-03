import { IFieldResolver } from "@graphql-tools/utils";
import { Log } from "@utils/logger";
import { gql } from "apollo-server-core";
import { mapSelections } from "graphql-map-selections";
import { Context } from "../../context";
import { PaginationOption } from "../core/pagination";
import { SpaceObject, toSpaceSelect } from "./SpaceObject";

type AvailableSpacesByAccountArgs = {
    accountId: string;
    paginate: PaginationOption;
};

type AvailableSpacesByAccountResult = Promise<Array<SpaceObject>>;

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
        ...toSpaceSelect(mapSelections(info)),
        take,
        skip,
    });

    Log(allSpaces);

    return allSpaces || [];
};

export const availableSpacesByAccountTypeDefs = gql`
    type Query {
        availableSpacesByAccount(accountId: ID!, paginate: PaginationOption): [SpaceObject]
    }
`;

export const availableSpacesByAccountResolvers = {
    Query: { availableSpacesByAccount },
};
