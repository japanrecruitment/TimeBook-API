import { IFieldResolver } from "@graphql-tools/utils";
import { gql } from "apollo-server-core";
import { GqlError } from "../../../error";
import { Context } from "../../../context";
import { Result } from "../../core/result";

type DisableSpaceTypeArgs = { id: string };

type DisableSpaceTypeResult = Promise<Result>;

type DisableSpaceType = IFieldResolver<any, Context, DisableSpaceTypeArgs, DisableSpaceTypeResult>;

const disableSpaceType: DisableSpaceType = async (_, { id }, { dataSources, store }) => {
    const updatedSpaceType = await store.spaceType.update({ where: { id }, data: { available: false } });

    if (!updatedSpaceType) throw new GqlError({ code: "BAD_REQUEST", message: "Space type not found" });

    dataSources.redis.deleteMany("space-types:*");

    return { message: `Successfully disabled ${updatedSpaceType.title} space type` };
};

export const disableSpaceTypeTypeDefs = gql`
    type Mutation {
        disableSpaceType(id: ID!): Result! @auth(requires: [admin])
    }
`;

export const disableSpaceTypeResolvers = {
    Mutation: { disableSpaceType },
};
