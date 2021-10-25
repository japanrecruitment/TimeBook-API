import { IFieldResolver } from "@graphql-tools/utils";
import { gql } from "apollo-server-core";
import { mapSelections } from "graphql-map-selections";
import { Context } from "../../context";
import { SpaceObject, toSpaceSelect } from "./SpaceObject";

type MySpacesArgs = any;

type MySpacesResult = Promise<Array<SpaceObject>>;

type MySpaces = IFieldResolver<any, Context, MySpacesArgs, MySpacesResult>;

const mySpaces: MySpaces = async (_, __, { store, authData }, info) => {
    const { accountId } = authData;

    const mySpaces = await store.space.findMany({
        where: { accountId, isDeleted: false },
        ...toSpaceSelect(mapSelections(info)),
    });

    return mySpaces || [];
};

export const mySpacesTypeDefs = gql`
    type Query {
        mySpaces: [SpaceObject] @auth(requires: [host])
    }
`;

export const mySpacesResolvers = {
    Query: { mySpaces },
};
