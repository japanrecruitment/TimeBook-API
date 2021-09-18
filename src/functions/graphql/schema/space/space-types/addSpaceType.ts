import { IFieldResolver } from "@graphql-tools/utils";
import { gql } from "apollo-server-express";
import { GqlError } from "src/functions/graphql/error";
import { Context } from "../../../context";
import { Result } from "../../core/result";

type AddSpaceTypeInput = {
    title: string;
    description: string;
};

type AddSpaceTypeArgs = { input: AddSpaceTypeInput };

type AddSpaceTypeResult = Promise<Result>;

type AddSpaceType = IFieldResolver<any, Context, AddSpaceTypeArgs, AddSpaceTypeResult>;

const addSpaceType: AddSpaceType = async (_, { input }, { dataSources, store }) => {
    let { title, description } = input;
    title = title.trim();
    description = description.trim();

    if (!title) throw new GqlError({ code: "BAD_USER_INPUT", message: "Invalid title" });

    if (!description) throw new GqlError({ code: "BAD_USER_INPUT", message: "Invalid description" });

    const spaceType = await store.spaceType.findFirst({ where: { title } });

    if (spaceType) throw new GqlError({ code: "BAD_REQUEST", message: "The title for space type is already in use" });

    await store.spaceType.create({ data: { title, description } });

    dataSources.redis.deleteMany("space-types:*");

    return { message: `Successfully added ${title} space type` };
};

export const addSpaceTypeTypeDefs = gql`
    input AddSpaceTypeInput {
        title: String!
        description: String!
    }

    type Mutation {
        addSpaceType(input: AddSpaceTypeInput!): Result! @auth(requires: [admin])
    }
`;

export const addSpaceTypeResolvers = {
    Mutation: { addSpaceType },
};
