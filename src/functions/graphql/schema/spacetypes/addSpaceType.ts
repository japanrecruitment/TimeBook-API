import { IFieldResolver } from "@graphql-tools/utils";
import { gql } from "apollo-server-core";
import { Context } from "../../context";
import { GqlError } from "../../error";
import { Result } from "../core/result";

type SpaceTypeInput = {
    title: string;
    description: string;
};

type SpaceType = IFieldResolver<any, Context, Record<"input", SpaceTypeInput>, Promise<Result>>;

const addSpaceType: SpaceType = async (_, { input }, { store }) => {
    let { title, description } = input;
    const isValid = title.trim() && description.trim();
    if (!isValid) throw new GqlError({ code: "BAD_USER_INPUT", message: "Provide all neccessary fields" });
    const spaceType = await store.spaceType.findFirst({ where: { title } });
    if (spaceType)
        throw new GqlError({ code: "BAD_USER_INPUT", message: "The title for space type is already in use" });
    await store.spaceType.create({ data: { title, description } });

    return { message: `Successfully registered space type` };
};

export const addSpaceTypeTypeDefs = gql`
    input AddSpaceTypeInput {
        title: String!
        description: String!
    }

    type Mutation {
        addSpaceType(input: AddSpaceTypeInput!): Result! @auth(requires: [admin, user, host])
    }
`;

export const addSpaceTypeResolvers = {
    Mutation: { addSpaceType },
};
