import { gql } from "apollo-server-core";
import { Context } from "../../context";
import { IFieldResolver } from "@graphql-tools/utils";
import { GqlError } from "../../error";
import { Result } from "../core/result";

type UpdateMySpaceInput = {
    id: string;
    name?: string;
    maximumCapacity?: number;
    numberOfSeats?: number;
    spaceSize?: number;
};

type UpdateMySpaceArgs = { input: UpdateMySpaceInput };

type UpdateMySpaceResult = Promise<Result>;

type UpdateMySpace = IFieldResolver<any, Context, UpdateMySpaceArgs, UpdateMySpaceResult>;

const updateMySpace: UpdateMySpace = async (_, { input }, { authData, store, dataSources }) => {
    const { accountId } = authData;
    const { id, name, maximumCapacity, numberOfSeats, spaceSize } = input;

    if (!name && !maximumCapacity && !numberOfSeats && !spaceSize)
        throw new GqlError({ code: "BAD_REQUEST", message: "All fields in submited space are empty" });

    const space = await store.space.findFirst({ where: { id, isDeleted: false }, select: { accountId: true } });

    if (!space) throw new GqlError({ code: "NOT_FOUND", message: "Space not found" });

    if (accountId !== space.accountId)
        throw new GqlError({ code: "FORBIDDEN", message: "You are not allowed to modify this space" });

    if (name?.trim() === "") throw new GqlError({ code: "BAD_USER_INPUT", message: "Space name cannot be empty" });

    if (maximumCapacity && maximumCapacity < 0)
        throw new GqlError({ code: "BAD_USER_INPUT", message: "Invalid maximum capacity" });

    if (numberOfSeats && numberOfSeats < 0)
        throw new GqlError({ code: "BAD_USER_INPUT", message: "Invalid number of seats" });

    if (spaceSize && spaceSize < 0) throw new GqlError({ code: "BAD_USER_INPUT", message: "Invalid space size" });

    const updatedSpace = await store.space.update({ where: { id }, data: { ...input, name: name?.trim() } });

    await dataSources.spaceAlgolia.partialUpdateObject({
        objectID: id,
        name: updatedSpace.name,
        maximumCapacity: updatedSpace.maximumCapacity,
        numberOfSeats: updatedSpace.numberOfSeats,
        spaceSize: updatedSpace.spaceSize,
    });

    return { message: `Successfully updated space` };
};

export const updateMySpaceTypeDefs = gql`
    input UpdateMySpaceInput {
        id: ID!
        name: String
        maximumCapacity: Int
        numberOfSeats: Int
        spaceSize: Float
    }

    type Mutation {
        updateMySpace(input: UpdateMySpaceInput!): Result! @auth(requires: [user, host])
    }
`;

export const updateMySpaceResolvers = {
    Mutation: { updateMySpace },
};
