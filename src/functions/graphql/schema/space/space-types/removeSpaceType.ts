import { IFieldResolver } from "@graphql-tools/utils";
import { gql } from "apollo-server-express";
import { GqlError } from "src/functions/graphql/error";
import { Context } from "../../../context";
import { Result } from "../../core/result";

type RemoveSpaceTypeInput = {
    id: string;
};

type RemoveSpaceTypeArgs = { input: RemoveSpaceTypeInput };

type RemoveSpaceTypeResult = Promise<Result>;

type RemoveSpaceType = IFieldResolver<any, Context, RemoveSpaceTypeArgs, RemoveSpaceTypeResult>;

const removeSpaceType: RemoveSpaceType = async (_, { input }, { dataSources, store }) => {
    let { id } = input;

    const spaceType = await store.spaceType.findUnique({ where: { id } });

    if (!spaceType) throw new GqlError({ code: "BAD_REQUEST", message: "Space type not found" });

    await store.spaceType.delete({ where: { id } });

    dataSources.redis.deleteMany("space-types:*");

    return { message: `Successfully updated ${spaceType.title} space type` };
};

export const removeSpaceTypeTypeDefs = gql`
    input RemoveSpaceTypeInput {
        id: ID!
    }

    type Mutation {
        removeSpaceType(input: RemoveSpaceTypeInput!): Result! @auth(requires: [admin])
    }
`;

export const removeSpaceTypeResolvers = {
    Mutation: { removeSpaceType },
};
