import { IFieldResolver } from "@graphql-tools/utils";
import { gql } from "apollo-server-core";
import { GqlError } from "src/functions/graphql/error";
import { Context } from "../../../context";
import { Result } from "../../core/result";

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
        select: { id: true, accountId: true, spaceTypes: { select: { spaceTypeId: true } } },
    });

    if (!space) throw new GqlError({ code: "NOT_FOUND", message: "Space not found" });

    if (accountId !== space.accountId)
        throw new GqlError({ code: "FORBIDDEN", message: "You are not allowed to modify this space" });

    const types = await store.spaceType.findMany({
        where: { id: { in: spaceTypeIds }, available: true },
        select: { id: true },
    });

    const prevTypeIds = space.spaceTypes?.map(({ spaceTypeId }) => spaceTypeId);
    const currTypeIds = types?.map(({ id }) => id);

    if (prevTypeIds === currTypeIds) return { message: "No changes found in the selected space types" };

    const typesToAdd = currTypeIds?.filter((id) => !prevTypeIds?.includes(id)).map((spaceTypeId) => ({ spaceTypeId }));
    const typesToDelete = prevTypeIds?.filter((id) => !currTypeIds?.includes(id));

    const toAddLength = typesToAdd?.length;
    const toDeleteLength = typesToDelete?.length;

    if (toAddLength <= 0 && toDeleteLength <= 0) return { message: `No changes found in submited space types` };

    const updatedSpace = await store.space.update({
        where: { id: spaceId },
        data: {
            spaceTypes: {
                deleteMany: toDeleteLength > 0 ? { spaceTypeId: { in: typesToDelete } } : undefined,
                createMany: toAddLength > 0 ? { data: typesToAdd, skipDuplicates: true } : undefined,
            },
        },
        select: { id: true, spaceTypes: { select: { spaceType: { select: { title: true } } } } },
    });

    await dataSources.spaceAlgolia.partialUpdateObject({
        objectID: updatedSpace.id,
        spaceTypes: updatedSpace.spaceTypes?.map(({ spaceType }) => spaceType.title),
    });

    return { message: `Successfull added ${toAddLength} types and removed ${toDeleteLength} types from your space` };
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
