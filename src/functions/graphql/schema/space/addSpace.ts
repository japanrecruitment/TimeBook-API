import { IFieldResolver } from "@graphql-tools/utils";
import { gql } from "apollo-server-express";
import { mapSelections } from "graphql-map-selections";
import { Context } from "../../context";
import { GqlError } from "../../error";
import { Result } from "../core/result";

type AddSpaceInput = {
    name: string;
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

    const { name, maximumCapacity, numberOfSeats, spaceSize } = input;

    if (!name || !name.trim()) throw new GqlError({ code: "BAD_USER_INPUT", message: "Space name cannot be empty" });

    if (maximumCapacity && maximumCapacity < 0)
        throw new GqlError({ code: "BAD_USER_INPUT", message: "Invalid maximum capacity" });

    if (numberOfSeats && numberOfSeats < 0)
        throw new GqlError({ code: "BAD_USER_INPUT", message: "Invalid number of seats" });

    if (spaceSize && spaceSize < 0) throw new GqlError({ code: "BAD_USER_INPUT", message: "Invalid space size" });

    const space = await store.space.create({
        data: { ...input, name: name.trim(), account: { connect: { id: accountId } } },
    });

    await dataSources.spaceAlgolia.saveObject({ objectID: space.id, name, maximumCapacity, numberOfSeats, spaceSize });

    return { message: "Successfully added a new space" };
};

export const addSpaceTypeDefs = gql`
    input AddSpaceInput {
        name: String!
        maximumCapacity: Int
        numberOfSeats: Int
        spaceSize: Float
    }

    type Mutation {
        addSpace(input: AddSpaceInput!): SpaceObject! @auth(requires: [user, host])
    }
`;

export const addSpaceResolvers = { Mutation: { addSpace } };
