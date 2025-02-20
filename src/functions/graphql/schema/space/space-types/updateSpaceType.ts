import { IFieldResolver } from "@graphql-tools/utils";
import { gql } from "apollo-server-core";
import { isEmpty } from "lodash";
import { GqlError } from "src/functions/graphql/error";
import { Context } from "../../../context";
import { Result } from "../../core/result";

type UpdateSpaceTypeInput = {
    id: string;
    title?: string;
    description?: string;
    available?: boolean;
};

type UpdateSpaceTypeArgs = { input: UpdateSpaceTypeInput };

type UpdateSpaceTypeResult = Promise<Result>;

type UpdateSpaceType = IFieldResolver<any, Context, UpdateSpaceTypeArgs, UpdateSpaceTypeResult>;

const updateSpaceType: UpdateSpaceType = async (_, { input }, { dataSources, store }) => {
    let { id, title, description, available } = input;
    title = title?.trim();
    description = description?.trim();

    if (title && isEmpty(title)) throw new GqlError({ code: "BAD_USER_INPUT", message: "無効なタイトル" });

    if (description && isEmpty(description)) throw new GqlError({ code: "BAD_USER_INPUT", message: "無効な説明" });

    const spaceType = await store.spaceType.findUnique({ where: { id } });

    if (!spaceType) throw new GqlError({ code: "BAD_REQUEST", message: "スペースタイプが見つかりません" });

    const updatedSpaceType = await store.spaceType.update({ where: { id }, data: { title, description, available } });

    dataSources.redis.deleteMany("space-types:*");

    return { message: `「${updatedSpaceType.title}」スペースタイプが更新されました` };
};

export const updateSpaceTypeTypeDefs = gql`
    input UpdateSpaceTypeInput {
        id: ID!
        title: String
        description: String
        available: Boolean
    }

    type Mutation {
        updateSpaceType(input: UpdateSpaceTypeInput!): Result! @auth(requires: [admin])
    }
`;

export const updateSpaceTypeResolvers = {
    Mutation: { updateSpaceType },
};
