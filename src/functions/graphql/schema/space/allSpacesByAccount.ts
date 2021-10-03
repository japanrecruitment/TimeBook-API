import { IFieldResolver } from "@graphql-tools/utils";
import { Log } from "@utils/logger";
import { gql } from "apollo-server-core";
import { mapSelections } from "graphql-map-selections";
import { Context } from "../../context";
import { PaginationOption } from "../core/paginationOption";
import { SpaceObject, toSpaceSelect } from "./SpaceObject";

type AllSpacesByAccountArgs = {
    accountId: string;
    paginate: PaginationOption;
};

type AllSpacesByAccountResult = Promise<Array<SpaceObject>>;

type AllSpacesByAccount = IFieldResolver<any, Context, AllSpacesByAccountArgs, AllSpacesByAccountResult>;

const allSpacesByAccount: AllSpacesByAccount = async (_, { accountId, paginate }, { store }, info) => {
    const { take, skip } = paginate || {};

    const allSpaces = await store.space.findMany({
        where: { isDeleted: false, accountId },
        ...toSpaceSelect(mapSelections(info)),
        take,
        skip,
    });

    Log(allSpaces);

    return allSpaces || [];
};

export const allSpacesByAccountTypeDefs = gql`
    type Query {
        allSpacesByAccount(accountId: ID!, paginate: PaginationOption): [SpaceObject] @auth(requires: [admin])
    }
`;

export const allSpacesByAccountResolvers = {
    Query: { allSpacesByAccount },
};
