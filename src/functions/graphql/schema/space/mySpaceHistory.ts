import { IFieldResolver } from "@graphql-tools/utils";
import { gql } from "apollo-server-core";
import { mapSelections } from "graphql-map-selections";
import { Context } from "../../context";
import { SpaceObject, toSpaceSelect } from "./SpaceObject";

type MySpaceHistoryArgs = any;

type MySpaceHistoryResult = Promise<Array<SpaceObject>>;

type MySpaceHistory = IFieldResolver<any, Context, MySpaceHistoryArgs, MySpaceHistoryResult>;

const mySpaceHistory: MySpaceHistory = async (_, __, { store, authData }, info) => {
    const { accountId } = authData;

    const mySpaces = await store.space.findMany({
        where: { accountId, isDeleted: true },
        ...toSpaceSelect(mapSelections(info)),
    });

    return mySpaces || [];
};

export const mySpaceHistoryTypeDefs = gql`
    type Query {
        mySpaceHistory: [SpaceObject] @auth(requires: [user, host])
    }
`;

export const mySpaceHistoryResolvers = {
    Query: { mySpaceHistory },
};
