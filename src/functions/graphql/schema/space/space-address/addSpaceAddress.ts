import { IFieldResolver } from "@graphql-tools/utils";
import { gql } from "apollo-server-express";
import { GqlError } from "src/functions/graphql/error";
import { Context } from "../../../context";
import { AddAddressInput } from "../../address";
import { Result } from "../../core/result";

type AddSpaceAddressArgs = { spaceId: string; address: AddAddressInput };

type AddSpaceAddressResult = Promise<Result>;

type AddSpaceAddress = IFieldResolver<any, Context, AddSpaceAddressArgs, AddSpaceAddressResult>;

const addSpaceAddress: AddSpaceAddress = async (_, { spaceId, address }, { authData, dataSources, store }) => {
    const { accountId } = authData;
    const { addressLine1, addressLine2, city, latitude, longitude, postalCode, prefectureId } = address;

    const space = await store.space.findUnique({ where: { id: spaceId }, select: { accountId: true } });

    if (!space) throw new GqlError({ code: "NOT_FOUND", message: "Space not found" });

    if (accountId !== space.accountId)
        throw new GqlError({ code: "FORBIDDEN", message: "You are not allowed to modify this space" });

    if (addressLine1?.trim() === "")
        throw new GqlError({ code: "BAD_USER_INPUT", message: "Address line 1 cannot be empty" });

    if (city?.trim() === "") throw new GqlError({ code: "BAD_USER_INPUT", message: "City cannot be empty" });

    if (postalCode?.trim() === "")
        throw new GqlError({ code: "BAD_USER_INPUT", message: "Postal code cannot be empty" });

    if (!prefectureId) throw new GqlError({ code: "BAD_USER_INPUT", message: "Prefecture is required" });

    const prefecture = await store.prefecture.findUnique({ where: { id: prefectureId } });

    if (!prefecture) throw new GqlError({ code: "BAD_USER_INPUT", message: "Invalid prefecture selected" });

    const newAddress = await store.address.create({
        data: {
            addressLine1: addressLine1?.trim(),
            addressLine2: addressLine2?.trim(),
            city: city?.trim(),
            latitude,
            longitude,
            postalCode: postalCode?.trim(),
            prefecture: { connect: { id: prefectureId } },
            space: { connect: { id: spaceId } },
        },
        select: { prefecture: { select: { name: true } }, spaceId: true },
    });

    await dataSources.spaceAlgolia.partialUpdateObject({
        objectID: newAddress.spaceId,
        prefecture: newAddress.prefecture.name,
    });

    return { message: `Successfully added address in your space` };
};

export const addSpaceAddressTypeDefs = gql`
    type Mutation {
        addSpaceAddress(spaceId: ID!, address: AddAddressInput!): Result! @auth(requires: [user, host])
    }
`;

export const addSpaceAddressResolvers = {
    Mutation: { addSpaceAddress },
};
