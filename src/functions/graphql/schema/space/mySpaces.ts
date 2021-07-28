import { IFieldResolver } from "@graphql-tools/utils";
import { gql } from "apollo-server-core";
import { Context } from "../../context";
import { SpaceResult } from "./allSpaces";

type MySpaces = IFieldResolver<any, Context, Record<string, any>, Promise<SpaceResult[]>>;

const mySpaces: MySpaces = async (_, __, { store, authData }) => {
    const { accountId } = authData;

    const mySpaces = await store.space.findMany({
        where: { accountId: accountId },
        include: { spaceTypes: { include: { spaceType: true } } },
    });

    const result = mySpaces.map((space) => {
        const spaceTypes = space.spaceTypes.map((spaceType) => spaceType.spaceType);
        return { ...space, spaceTypes };
    });

    return result || [];
};

export const mySpacesTypeDefs = gql`
    type Query {
        mySpaces: [Space] @auth(requires: [user, host])
    }
`;

export const mySpacesResolvers = {
    Query: { mySpaces },
};
