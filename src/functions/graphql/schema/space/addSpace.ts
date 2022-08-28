import { IFieldResolver } from "@graphql-tools/utils";
import { gql } from "apollo-server-core";
import { isEmpty } from "lodash";
import { Context } from "../../context";
import { GqlError } from "../../error";
import { Result } from "../core/result";
import { SpaceObject } from "./SpaceObject";

function validateAddSpaceInput(input: AddSpaceInput): AddSpaceInput {
    let {
        description,
        name,
        additionalOptions,
        cancelPolicyId,
        includedOptions,
        maximumCapacity,
        needApproval,
        numberOfSeats,
        spaceSize,
        subcriptionPrice,
    } = input;

    description = description?.trim();
    name = name?.trim();

    if (isEmpty(description))
        throw new GqlError({ code: "BAD_USER_INPUT", message: "Space description cannot be empty" });

    if (isEmpty(name)) throw new GqlError({ code: "BAD_USER_INPUT", message: "Space name cannot be empty" });

    if (maximumCapacity && maximumCapacity < 0)
        throw new GqlError({ code: "BAD_USER_INPUT", message: "Invalid maximum capacity" });

    if (numberOfSeats && numberOfSeats < 0)
        throw new GqlError({ code: "BAD_USER_INPUT", message: "Invalid number of seats" });

    if (spaceSize && spaceSize < 0) throw new GqlError({ code: "BAD_USER_INPUT", message: "Invalid space size" });

    if (subcriptionPrice && subcriptionPrice < 0)
        throw new GqlError({ code: "BAD_USER_INPUT", message: "Invalid subscription price" });

    if (!additionalOptions) additionalOptions = [];
    if (!includedOptions) includedOptions = [];

    return {
        description,
        name,
        additionalOptions,
        cancelPolicyId,
        includedOptions,
        maximumCapacity,
        needApproval,
        numberOfSeats,
        spaceSize,
        subcriptionPrice,
    };
}

type AddSpaceInput = {
    name: string;
    description: string;
    maximumCapacity?: number;
    needApproval?: boolean;
    numberOfSeats?: number;
    spaceSize?: number;
    cancelPolicyId?: string;
    includedOptions?: string[];
    additionalOptions?: string[];
    subcriptionPrice?: number;
};

type AddSpaceArgs = { input: AddSpaceInput };

type AddSpaceResult = { space: SpaceObject; result: Result };

type AddSpace = IFieldResolver<any, Context, AddSpaceArgs, Promise<AddSpaceResult>>;

const addSpace: AddSpace = async (_, { input }, { authData, dataSources, store }) => {
    const { accountId } = authData || {};
    if (!accountId) throw new GqlError({ code: "FORBIDDEN", message: "Invalid token!!" });

    const { additionalOptions, cancelPolicyId, includedOptions, ...data } = validateAddSpaceInput(input);

    const space = await store.space.create({
        data: {
            ...data,
            cancelPolicy: cancelPolicyId ? { connect: { id: cancelPolicyId } } : undefined,
            account: { connect: { id: accountId } },
        },
    });

    let _includedOptions = [];
    if (!isEmpty(includedOptions)) {
        _includedOptions = await Promise.all(
            includedOptions.map((id) =>
                store.option.update({ where: { id: id }, data: { inSpaces: { connect: { id: space.id } } } })
            )
        );
    }

    let _additionalOptions = [];
    if (!isEmpty(additionalOptions)) {
        _additionalOptions = await Promise.all(
            additionalOptions.map((id) =>
                store.option.update({ where: { id: id }, data: { adSpaces: { connect: { id: space.id } } } })
            )
        );
    }

    if (space.published) {
        await dataSources.spaceAlgolia.saveObject({
            objectID: space.id,
            name: space.name,
            maximumCapacity: space.maximumCapacity,
            numberOfSeats: space.numberOfSeats,
            spaceSize: space.spaceSize,
            subcriptionPrice: [space.subcriptionPrice],
        });
    }

    return {
        space: { ...space, includedOptions: _includedOptions, additionalOptions: _additionalOptions },
        result: { message: "Successfully added a new space" },
    };
};

export const addSpaceTypeDefs = gql`
    input AddSpaceInput {
        name: String!
        description: String!
        maximumCapacity: Int
        needApproval: Boolean
        numberOfSeats: Int
        spaceSize: Float
        cancelPolicyId: ID
        includedOptions: [ID]
        additionalOptions: [ID]
        subcriptionPrice: Int
    }

    type AddSpaceResult {
        result: Result
        space: SpaceObject
    }

    type Mutation {
        addSpace(input: AddSpaceInput!): AddSpaceResult! @auth(requires: [host])
    }
`;

export const addSpaceResolvers = { Mutation: { addSpace } };
