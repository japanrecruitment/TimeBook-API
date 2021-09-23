import { IFieldResolver } from "@graphql-tools/utils";
import { gql } from "apollo-server-core";
import { GqlError } from "../../../error";
import { Context } from "../../../context";
import { Result } from "../../core/result";

type EnableSpaceTypeArgs = { id: string };

type EnableSpaceTypeResult = Promise<Result>;

type EnableSpaceType = IFieldResolver<any, Context, EnableSpaceTypeArgs, EnableSpaceTypeResult>;

const enableSpaceType: EnableSpaceType = async (_, { id }, { dataSources, store }) => {
    const updatedSpaceType = await store.spaceType.update({ where: { id }, data: { available: true } });

    if (!updatedSpaceType) throw new GqlError({ code: "BAD_REQUEST", message: "Space type not found" });

    dataSources.redis.deleteMany("space-types:*");

    return { message: `Successfully enabled ${updatedSpaceType.title} space type` };
};

export const enableSpaceTypeTypeDefs = gql`
    type Mutation {
        enableSpaceType(id: String!): Result! @auth(requires: [admin])
    }
`;

export const enableSpaceTypeResolvers = {
    Mutation: { enableSpaceType },
};
