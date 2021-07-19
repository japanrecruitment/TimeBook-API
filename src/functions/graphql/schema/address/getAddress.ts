import { IFieldResolver } from "@graphql-tools/utils";
import { Address } from "@prisma/client";
import { gql } from "apollo-server-core";
import { Context } from "../../context";

type AddressInput = { id: string };

type GetAddress = IFieldResolver<any, Context, Record<"input", AddressInput>, Promise<Address>>;

const getAddress: GetAddress = async (_, { input }, { store }) => {
    const { id } = input;
    return await store.address.findUnique({ where: { id } });
};

export const getAddressTypeDefs = gql`
    type Address {
        id: ID!
        addressLine1: String
        addressLine2: String
        city: String
        longitude: Float
        latitude: Float
        postalCode: String
    }

    input AddressInput {
        id: ID
    }

    type Query {
        getAddress(input: AddressInput): Address
    }
`;

export const getAddressResolver = {
    Query: { getAddress },
};
