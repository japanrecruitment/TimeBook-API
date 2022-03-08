import { IFieldResolver } from "@graphql-tools/utils";
import { gql } from "apollo-server-core";
import { GqlError } from "src/functions/graphql/error";
import { Context } from "../../../context";
import { Result } from "../../core/result";

type RemoveSpaceSettingArgs = { id: string };

type RemoveSpaceSettingResult = Promise<Result>;

type RemoveSpaceSetting = IFieldResolver<any, Context, RemoveSpaceSettingArgs, RemoveSpaceSettingResult>;

const removeSpaceSetting: RemoveSpaceSetting = async (_, { id }, { authData, store }) => {
    const { accountId } = authData;

    const setting = await store.spaceSetting.findUnique({
        where: { id },
        select: { space: { select: { accountId: true } } },
    });

    if (!setting) throw new GqlError({ code: "NOT_FOUND", message: "Space setting not found" });

    if (accountId !== setting.space.accountId)
        throw new GqlError({ code: "FORBIDDEN", message: "You are not allowed to modify this space setting" });

    await store.spaceSetting.delete({ where: { id } });

    return { message: `Space setting removed successfully` };
};

export const removeSpaceSettingTypeDefs = gql`
    type Mutation {
        removeSpaceSetting(id: ID!): Result @auth(requires: [user, host])
    }
`;

export const removeSpaceSettingResolvers = { Mutation: { removeSpaceSetting } };
