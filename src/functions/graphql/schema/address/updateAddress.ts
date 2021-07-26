import { IFieldResolver } from "@graphql-tools/utils";
import { Address } from "@prisma/client";
import { gql } from "apollo-server-core";
import { Context } from "../../context";

type UpdateAddressInput = Partial<Address>;

type UpdateAddress = IFieldResolver<any, Context, Record<"input", UpdateAddressInput>, Promise<Address>>;

const updateAddress: UpdateAddress = async (_, { input }, { store }) => {
    const { id, ...data } = input;
    return await store.address.update({ where: { id }, data });
};

export const updateAddressTypeDefs = gql`
    input UpdateAddressInput {
        id: ID!
        addressLine1: String
        addressLine2: String
        city: String
        longitude: Float
        latitude: Float
        postalCode: String
    }

    type Mutation {
        updateAddress(input: UpdateAddressInput): Address
    }
`;

export const updateAddressResolvers = {
    Mutation: { updateAddress },
};
