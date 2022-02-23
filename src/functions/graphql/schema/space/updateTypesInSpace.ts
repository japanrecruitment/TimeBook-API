import { IFieldResolver } from "@graphql-tools/utils";
import { gql } from "apollo-server-core";
import { GqlError } from "src/functions/graphql/error";
import { Context } from "../../context";
import { Result } from "../core/result";

type UpdateTypesInSpaceInput = {
    spaceId: string;
    spaceTypeIds: string[];
};

type UpdateTypesInSpaceArgs = { input: UpdateTypesInSpaceInput };

type UpdateTypesInSpaceResult = Promise<Result>;

type UpdateTypesInSpace = IFieldResolver<any, Context, UpdateTypesInSpaceArgs, UpdateTypesInSpaceResult>;

const updateTypesInSpace: UpdateTypesInSpace = async (_, { input }, { authData, dataSources, store }) => {
    const { accountId } = authData;
    const { spaceId, spaceTypeIds } = input;

    const space = await store.space.findFirst({
        where: { id: spaceId, isDeleted: false },
        select: { id: true, accountId: true, spaceTypes: { select: { id: true } } },
    });

    if (!space) throw new GqlError({ code: "NOT_FOUND", message: "Space not found" });

    if (accountId !== space.accountId)
        throw new GqlError({ code: "FORBIDDEN", message: "You are not allowed to modify this space" });

    const types = await store.spaceType.findMany({
        where: { id: { in: spaceTypeIds }, available: true },
        select: { id: true },
    });

    const prevTypeIds = space.spaceTypes?.map(({ id }) => id);
    const currTypeIds = types?.map(({ id }) => id);

    if (prevTypeIds === currTypeIds) return { message: "No changes found in the selected space types" };

    const typesToConnect = currTypeIds?.filter((id) => !prevTypeIds?.includes(id)).map((id) => ({ id }));
    const typesToDisconnect = prevTypeIds?.filter((id) => !currTypeIds?.includes(id)).map((id) => ({ id }));

    const toConnectLength = typesToConnect?.length;
    const toDisconnectLength = typesToDisconnect?.length;

    if (toConnectLength <= 0 && toDisconnectLength <= 0) return { message: `No changes found in submited space types` };

    const updatedSpace = await store.space.update({
        where: { id: spaceId },
        data: {
            spaceTypes: {
                disconnect: toDisconnectLength > 0 ? typesToDisconnect : undefined,
                connect: toConnectLength > 0 ? typesToConnect : undefined,
            },
        },
        select: { id: true, published: true, spaceTypes: { select: { title: true } } },
    });

    if (updatedSpace.published) {
        await dataSources.spaceAlgolia.partialUpdateObject({
            objectID: updatedSpace.id,
            spaceTypes: updatedSpace.spaceTypes?.map(({ title }) => title),
        });
    }

    return {
        message: `Successfull added ${toConnectLength} types and removed ${toDisconnectLength} types from your space`,
    };
};

export const updateTypesInSpaceTypeDefs = gql`
    input UpdateTypesInSpaceInput {
        spaceId: ID!
        spaceTypeIds: [ID]!
    }

    type Mutation {
        updateTypesInSpace(input: UpdateTypesInSpaceInput!): Result! @auth(requires: [user, host])
    }
`;

export const updateTypesInSpaceResolvers = {
    Mutation: { updateTypesInSpace },
};
