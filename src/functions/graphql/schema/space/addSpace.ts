import { IFieldResolver } from "@graphql-tools/utils";
import { gql } from "apollo-server-core";
import { Context } from "../../context";
import { GqlError } from "../../error";
import { Result } from "../core/result";

type AddSpaceInput = {
    name: string;
    description: string;
    maximumCapacity?: number;
    numberOfSeats?: number;
    spaceSize?: number;
};

type AddSpaceArgs = { input: AddSpaceInput };

type AddSpaceResult = Promise<Result>;

type AddSpace = IFieldResolver<any, Context, AddSpaceArgs, AddSpaceResult>;

const addSpace: AddSpace = async (_, { input }, { authData, dataSources, store }) => {
    const { accountId } = authData || {};
    if (!accountId) throw new GqlError({ code: "FORBIDDEN", message: "Invalid token!!" });

    const { description, name, maximumCapacity, numberOfSeats, spaceSize } = input;

    if (!description || !description.trim())
        throw new GqlError({ code: "BAD_USER_INPUT", message: "Space description cannot be empty" });

    if (!name || !name.trim()) throw new GqlError({ code: "BAD_USER_INPUT", message: "Space name cannot be empty" });

    if (maximumCapacity && maximumCapacity < 0)
        throw new GqlError({ code: "BAD_USER_INPUT", message: "Invalid maximum capacity" });

    if (numberOfSeats && numberOfSeats < 0)
        throw new GqlError({ code: "BAD_USER_INPUT", message: "Invalid number of seats" });

    if (spaceSize && spaceSize < 0) throw new GqlError({ code: "BAD_USER_INPUT", message: "Invalid space size" });

    const space = await store.space.create({
        data: {
            ...input,
            name: name.trim(),
            description: description?.trim(),
            account: { connect: { id: accountId } },
        },
    });

    await dataSources.spaceAlgolia.saveObject({ objectID: space.id, name, maximumCapacity, numberOfSeats, spaceSize });

    return { spaceId: space.id, result: { message: "Successfully added a new space" } };
};

export const addSpaceTypeDefs = gql`
    input AddSpaceInput {
        name: String!
        description: String!
        maximumCapacity: Int
        numberOfSeats: Int
        spaceSize: Float
    }

    type AddSpaceResult {
        result: Result
        spaceId: ID!
    }

    type Mutation {
        addSpace(input: AddSpaceInput!): AddSpaceResult! @auth(requires: [host])
    }
`;

export const addSpaceResolvers = { Mutation: { addSpace } };
