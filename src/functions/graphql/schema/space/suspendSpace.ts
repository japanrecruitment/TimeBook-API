import { gql } from "apollo-server-core";
import { Context } from "../../context";
import { IFieldResolver } from "@graphql-tools/utils";
import { GqlError } from "../../error";
import { Result } from "../core/result";

type SuspendSpaceArgs = { id: string };

type SuspendSpaceResult = Promise<Result>;

type SuspendSpace = IFieldResolver<any, Context, SuspendSpaceArgs, SuspendSpaceResult>;

const suspendSpace: SuspendSpace = async (_, { id }, { store, dataSources }) => {
    const updatedSpace = await store.space.update({ where: { id }, data: { suspended: true } });

    if (!updatedSpace) throw new GqlError({ code: "NOT_FOUND", message: "Space not found" });

    await dataSources.spaceAlgolia.deleteObject(id);

    return { message: `Successfully suspended space named ${updatedSpace.name}` };
};

export const suspendSpaceTypeDefs = gql`
    type Mutation {
        suspendSpace(id: ID!): Result! @auth(requires: [admin])
    }
`;

export const suspendSpaceResolvers = {
    Mutation: { suspendSpace },
};
