import { IFieldResolver } from "@graphql-tools/utils";
import { gql } from "apollo-server-core";
import { GqlError } from "src/functions/graphql/error";
import { Context } from "../../context";
import { Result } from "../core/result";

type UpdateAmenitiesInSpaceInput = {
    spaceId: string;
    amenityIds: string[];
};

type UpdateAmenitiesInSpaceArgs = { input: UpdateAmenitiesInSpaceInput };

type UpdateAmenitiesInSpaceResult = Promise<Result>;

type UpdateAmenitiesInSpace = IFieldResolver<any, Context, UpdateAmenitiesInSpaceArgs, UpdateAmenitiesInSpaceResult>;

const updateAmenitiesInSpace: UpdateAmenitiesInSpace = async (_, { input }, { authData, dataSources, store }) => {
    const { accountId } = authData;
    const { spaceId, amenityIds } = input;

    const space = await store.space.findFirst({
        where: { id: spaceId, isDeleted: false },
        select: { id: true, accountId: true, availableAmenities: { select: { id: true } } },
    });

    if (!space) throw new GqlError({ code: "NOT_FOUND", message: "Space not found" });

    if (accountId !== space.accountId)
        throw new GqlError({ code: "FORBIDDEN", message: "You are not allowed to modify this space" });

    const types = await store.spaceAmenities.findMany({
        where: { id: { in: amenityIds } },
        select: { id: true },
    });

    const prevIds = space.availableAmenities?.map(({ id }) => id);
    const currIds = types?.map(({ id }) => id);

    if (prevIds === currIds) return { message: "No changes found in the selected space amenities" };

    const connectIds = currIds?.filter((id) => !prevIds?.includes(id)).map((id) => ({ id }));
    const disconnectIds = prevIds?.filter((id) => !currIds?.includes(id)).map((id) => ({ id }));

    const toConnectLength = connectIds?.length;
    const toDisconnectLength = disconnectIds?.length;

    if (toConnectLength <= 0 && toDisconnectLength <= 0) {
        return { message: `No changes found in submited space amenities` };
    }

    const updatedSpace = await store.space.update({
        where: { id: spaceId },
        data: {
            availableAmenities: {
                disconnect: toDisconnectLength > 0 ? disconnectIds : undefined,
                connect: toConnectLength > 0 ? connectIds : undefined,
            },
        },
        select: { id: true, published: true, availableAmenities: { select: { name: true } } },
    });

    if (updatedSpace.published) {
        await dataSources.spaceAlgolia.partialUpdateObject({
            objectID: updatedSpace.id,
            availableAmenities: updatedSpace.availableAmenities?.map(({ name }) => name),
        });
    }

    return {
        message: `Successfull added ${toConnectLength} amenities and removed ${toDisconnectLength} amenities from your space`,
    };
};

export const updateAmenitiesInSpaceTypeDefs = gql`
    input UpdateAmenitiesInSpaceInput {
        spaceId: ID!
        amenityIds: [ID]!
    }

    type Mutation {
        updateAmenitiesInSpace(input: UpdateAmenitiesInSpaceInput!): Result! @auth(requires: [user, host])
    }
`;

export const updateAmenitiesInSpaceResolvers = {
    Mutation: { updateAmenitiesInSpace },
};
