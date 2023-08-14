import { IFieldResolver } from "@graphql-tools/utils";
import { gql } from "apollo-server-core";
import { Context } from "../../context";
import { GqlError } from "../../error";
import { Result } from "../core/result";

type RemoveSpaceArgs = { id: string };

type RemoveSpaceResult = Promise<Result>;

type RemoveSpace = IFieldResolver<any, Context, RemoveSpaceArgs, RemoveSpaceResult>;

const removeSpace: RemoveSpace = async (_, { id }, { authData, dataSources, store }) => {
    const { accountId } = authData || {};

    if (!accountId) throw new GqlError({ code: "FORBIDDEN", message: "無効なリクエスト" });

    const space = await store.space.findUnique({ where: { id }, select: { name: true, accountId: true } });

    if (accountId !== space.accountId) throw new GqlError({ code: "FORBIDDEN", message: "無効なリクエスト" });

    const deletedSpace = await store.space.update({ where: { id }, data: { isDeleted: true } });

    if (deletedSpace.published) {
        await dataSources.spaceAlgolia.deleteObject(id);
    }

    return { message: `「${space.name}」スペースが削除されました` };
};

export const removeSpaceTypeDefs = gql`
    type Mutation {
        removeSpace(id: ID!): Result! @auth(requires: [user, host])
    }
`;

export const removeSpaceResolvers = { Mutation: { removeSpace } };
