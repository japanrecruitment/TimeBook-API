import { IFieldResolver } from "@graphql-tools/utils";
import { gql } from "apollo-server-core";
import { Context } from "../../context";
import { GqlError } from "../../error";
type GetMySpacesResult = any;

type MySpaces = IFieldResolver<any, Context, Record<string, any>, Promise<GetMySpacesResult>>;

const mySpaces: MySpaces = async (_, __, { store, authData }, info) => {
    const { accountId } = authData;

    const mySpaces = await store.space.findMany({
        where: { accountId: accountId },
    });
    if (!mySpaces) throw new GqlError({ code: "NOT_FOUND", message: "Space not found" });

    return mySpaces;
};

export const mySpacesTypeDefs = gql`
    type Query {
        getMySpaces: Space[] @auth(requires: [user, host])
    }
`;

export const mySpacesResolvers = {
    Query: { mySpaces },
};
