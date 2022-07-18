import { IFieldResolver } from "@graphql-tools/utils";
import { Log } from "@utils/logger";
import { gql } from "apollo-server-core";
import { mapSelections } from "graphql-map-selections";
import { Context } from "../../context";
import { GqlError } from "../../error";
import { AddressObject, toAddressSelect, UpdateAddressInput, validateUpdateAddressInput } from "../address";

type UpdateHotelAddressArgs = {
    input: UpdateAddressInput;
};

type UpdateHotelAddressResult = {
    message: string;
    address?: AddressObject;
};

type UpdateHotelAddress = IFieldResolver<any, Context, UpdateHotelAddressArgs, Promise<UpdateHotelAddressResult>>;

const updateHotelAddress: UpdateHotelAddress = async (_, { input }, { authData, store }, info) => {
    const { accountId } = authData || {};
    if (!accountId) throw new GqlError({ code: "FORBIDDEN", message: "Invalid token!!" });

    const validInput = validateUpdateAddressInput(input);
    const { id, addressLine1, addressLine2, city, postalCode, prefectureId } = validInput;

    if (prefectureId) {
        const prefecture = await store.prefecture.findFirst({ where: { id: prefectureId, available: true } });
        if (!prefecture) throw new GqlError({ code: "BAD_USER_INPUT", message: "Invalid prefecture selected" });
    }

    const address = await store.address.findUnique({
        where: { id },
        select: { hotel: { select: { accountId: true } } },
    });
    if (!address || !address.hotel) throw new GqlError({ code: "NOT_FOUND", message: "Address not found" });
    if (accountId !== address.hotel.accountId)
        throw new GqlError({ code: "FORBIDDEN", message: "You are not allowed to modify this hotel address" });

    const addressSelect = toAddressSelect(mapSelections(info)?.address)?.select;
    const updatedAddress = await store.address.update({
        where: { id },
        data: {
            addressLine1,
            addressLine2,
            city,
            postalCode,
            prefecture: prefectureId ? { connect: { id: prefectureId } } : undefined,
        },
        select: addressSelect,
    });

    Log(updatedAddress);

    return {
        message: "Successfully update hotel address",
        address: updatedAddress,
    };
};

export const updateHotelAddressTypeDefs = gql`
    type UpdateHotelAddressResult {
        message: String!
        address: AddressObject
    }

    type Mutation {
        updateHotelAddress(input: UpdateAddressInput!): UpdateHotelAddressResult @auth(requires: [host])
    }
`;

export const updateHotelAddressResolvers = { Mutation: { updateHotelAddress } };
