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

    if (isEmpty(description)) description = undefined;
    if (isEmpty(name)) name = undefined;
    if (!cancelPolicyId) cancelPolicyId = null;
    if (!maximumCapacity) maximumCapacity = null;
    if (!needApproval) needApproval = null;
    if (!numberOfSeats) numberOfSeats = null;
    if (!spaceSize) spaceSize = null;
    if (!subcriptionPrice) subcriptionPrice = null;

    if (
        !additionalOptions &&
        !description &&
        !includedOptions &&
        !maximumCapacity &&
        !name &&
        !numberOfSeats &&
        !spaceSize
    ) {
        throw new GqlError({ code: "BAD_REQUEST", message: "無効なリクエスト" });
    }

    if (maximumCapacity && maximumCapacity < 0)
        throw new GqlError({ code: "BAD_USER_INPUT", message: "最大人数が無効です" });

    if (numberOfSeats && numberOfSeats < 0)
        throw new GqlError({ code: "BAD_USER_INPUT", message: "無効な最大シート数" });

    if (spaceSize && spaceSize < 0) throw new GqlError({ code: "BAD_USER_INPUT", message: "無効なスペースサイズ" });

    if (subcriptionPrice && subcriptionPrice < 0)
        throw new GqlError({ code: "BAD_USER_INPUT", message: "無効なサブスクリプション料金" });

    return {
        id,
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

type UpdateMySpaceInput = {
    id: string;
    description?: string;
    name?: string;
    maximumCapacity?: number;
    needApproval?: boolean;
    numberOfSeats?: number;
    spaceSize?: number;
    cancelPolicyId?: string;
    includedOptions?: string[];
    additionalOptions?: string[];
    subcriptionPrice?: number;
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

    if (!space) throw new GqlError({ code: "NOT_FOUND", message: "スペースが見つかりません" });

    if (accountId !== space.accountId) throw new GqlError({ code: "FORBIDDEN", message: "無効なリクエスト" });

    const updatedSpace = await store.space.update({
        where: { id },
        data,
    });

    if (updatedSpace.published) {
        await dataSources.spaceAlgolia.partialUpdateObject({
            objectID: id,
            name: updatedSpace.name,
            maximumCapacity: updatedSpace.maximumCapacity,
            numberOfSeats: updatedSpace.numberOfSeats,
            spaceSize: updatedSpace.spaceSize,
            subcriptionPrice: [updatedSpace.subcriptionPrice],
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
                store.option.update({ where: { id }, data: { adSpaces: { connect: { id: space.id } } } })
            )
        );
    }
    if (!isEmpty(additionalOptionsToRemove)) {
        await Promise.all(
            additionalOptionsToRemove.map(({ id }) =>
                store.option.update({ where: { id }, data: { adSpaces: { disconnect: { id: space.id } } } })
            )
        );
    }

    return { message: `スペースが更新されました` };
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
        cancelPolicyId: ID
        includedOptions: [ID]
        additionalOptions: [ID]
        subcriptionPrice: Int
    }

    type Mutation {
        updateMySpace(input: UpdateMySpaceInput!): Result! @auth(requires: [user, host])
    }
`;

export const updateMySpaceResolvers = {
    Mutation: { updateMySpace },
};
