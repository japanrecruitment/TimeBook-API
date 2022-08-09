import { gql } from "apollo-server-core";
import { Context } from "../../context";
import { IFieldResolver } from "@graphql-tools/utils";
import { GqlError } from "../../error";
import { Result } from "../core/result";
import { differenceWith, isEmpty } from "lodash";

function validateUpdateMySpaceInput(input: UpdateMySpaceInput): UpdateMySpaceInput {
    let {
        id,
        description,
        name,
        additionalOptions,
        includedOptions,
        maximumCapacity,
        needApproval,
        numberOfSeats,
        spaceSize,
    } = input;

    description = description?.trim();
    name = name?.trim();

    if (isEmpty(description)) description = undefined;
    if (isEmpty(name)) name = undefined;
    if (!additionalOptions) additionalOptions = null;
    if (!includedOptions) includedOptions = null;
    if (!maximumCapacity) maximumCapacity = null;
    if (!needApproval) needApproval = null;
    if (!numberOfSeats) numberOfSeats = null;
    if (!spaceSize) spaceSize = null;

    if (
        !additionalOptions &&
        !description &&
        !includedOptions &&
        !maximumCapacity &&
        !name &&
        !numberOfSeats &&
        !spaceSize
    ) {
        throw new GqlError({ code: "BAD_REQUEST", message: "All fields in submited space are empty" });
    }

    if (maximumCapacity && maximumCapacity < 0)
        throw new GqlError({ code: "BAD_USER_INPUT", message: "Invalid maximum capacity" });

    if (numberOfSeats && numberOfSeats < 0)
        throw new GqlError({ code: "BAD_USER_INPUT", message: "Invalid number of seats" });

    if (spaceSize && spaceSize < 0) throw new GqlError({ code: "BAD_USER_INPUT", message: "Invalid space size" });

    return {
        id,
        description,
        name,
        additionalOptions,
        includedOptions,
        maximumCapacity,
        needApproval,
        numberOfSeats,
        spaceSize,
    };
}

type UpdateMySpaceInput = {
    id: string;
    description?: string;
    name?: string;
    maximumCapacity?: number;
    needApproval?: boolean;
    numberOfSeats?: number;
    spaceSize?: number;
    includedOptions?: string[];
    additionalOptions?: string[];
};

type UpdateMySpaceArgs = { input: UpdateMySpaceInput };

type UpdateMySpaceResult = Promise<Result>;

type UpdateMySpace = IFieldResolver<any, Context, UpdateMySpaceArgs, UpdateMySpaceResult>;

const updateMySpace: UpdateMySpace = async (_, { input }, { authData, store, dataSources }) => {
    const { accountId } = authData;
    const { id, additionalOptions, includedOptions, ...data } = validateUpdateMySpaceInput(input);

    const space = await store.space.findFirst({
        where: { id, isDeleted: false },
        select: {
            id: true,
            accountId: true,
            additionalOptions: { select: { id: true } },
            includedOptions: { select: { id: true } },
        },
    });

    if (!space) throw new GqlError({ code: "NOT_FOUND", message: "Space not found" });

    if (accountId !== space.accountId)
        throw new GqlError({ code: "FORBIDDEN", message: "You are not allowed to modify this space" });

    const updatedSpace = await store.space.update({ where: { id }, data });

    if (updatedSpace.published) {
        await dataSources.spaceAlgolia.partialUpdateObject({
            objectID: id,
            name: updatedSpace.name,
            maximumCapacity: updatedSpace.maximumCapacity,
            numberOfSeats: updatedSpace.numberOfSeats,
            spaceSize: updatedSpace.spaceSize,
        });
    }

    const includedOptionsToAdd = differenceWith(includedOptions, space.includedOptions, (a, b) => a === b.id);
    const includedOptionsToRemove = differenceWith(space.includedOptions, includedOptions, (a, b) => a.id === b);
    let includedOptionsResult = [];
    if (!isEmpty(includedOptionsToAdd)) {
        includedOptionsResult = await Promise.all(
            includedOptionsToAdd.map((id) =>
                store.option.update({ where: { id }, data: { inSpaces: { connect: { id: space.id } } } })
            )
        );
    }
    if (!isEmpty(includedOptionsToRemove)) {
        await Promise.all(
            includedOptionsToRemove.map(({ id }) =>
                store.option.update({ where: { id }, data: { inSpaces: { disconnect: { id: space.id } } } })
            )
        );
    }

    const additionalOptionsToAdd = differenceWith(additionalOptions, space.additionalOptions, (a, b) => a === b.id);
    const additionalOptionsToRemove = differenceWith(space.additionalOptions, additionalOptions, (a, b) => a.id === b);
    let additionalOptionsResult = [];
    if (!isEmpty(additionalOptionsToAdd)) {
        additionalOptionsResult = await Promise.all(
            additionalOptionsToAdd.map((id) =>
                store.option.update({ where: { id }, data: { adPackagePlans: { connect: { id: space.id } } } })
            )
        );
    }
    if (!isEmpty(additionalOptionsToRemove)) {
        await Promise.all(
            additionalOptionsToRemove.map(({ id }) =>
                store.option.update({ where: { id }, data: { adPackagePlans: { disconnect: { id: space.id } } } })
            )
        );
    }

    return { message: `Successfully updated space` };
};

export const updateMySpaceTypeDefs = gql`
    input UpdateMySpaceInput {
        id: ID!
        description: String
        name: String
        maximumCapacity: Int
        needApproval: Boolean
        numberOfSeats: Int
        spaceSize: Float
        includedOptions: [ID]
        additionalOptions: [ID]
    }

    type Mutation {
        updateMySpace(input: UpdateMySpaceInput!): Result! @auth(requires: [user, host])
    }
`;

export const updateMySpaceResolvers = {
    Mutation: { updateMySpace },
};
