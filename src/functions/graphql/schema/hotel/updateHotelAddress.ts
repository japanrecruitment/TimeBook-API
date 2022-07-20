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

const updateHotelAddress: UpdateHotelAddress = async (_, { input }, { authData, dataSources, store }, info) => {
    const { accountId } = authData || {};
    if (!accountId) throw new GqlError({ code: "FORBIDDEN", message: "Invalid token!!" });

    const validInput = validateUpdateAddressInput(input);
    const { id, addressLine1, addressLine2, city, postalCode, prefectureId } = validInput;

    const address = await store.address.findUnique({
        where: { id },
        include: { hotel: { select: { accountId: true } }, prefecture: true },
    });
    if (!address || !address.hotel) throw new GqlError({ code: "NOT_FOUND", message: "Address not found" });
    if (accountId !== address.hotel.accountId)
        throw new GqlError({ code: "FORBIDDEN", message: "You are not allowed to modify this hotel address" });

    let mPrefecture = address.prefecture;
    if (prefectureId) {
        const prefecture = await store.prefecture.findFirst({ where: { id: prefectureId, available: true } });
        if (!prefecture) throw new GqlError({ code: "BAD_USER_INPUT", message: "Invalid prefecture selected" });
        mPrefecture = prefecture;
    }

    let geoloc: { lat: number; lng: number } = { lat: address.latitude, lng: address.longitude };
    if (
        (addressLine1 && address.addressLine1 !== addressLine1) ||
        (city && address.city !== city) ||
        (prefectureId && address.prefectureId !== prefectureId)
    ) {
        geoloc = await dataSources.googleMap.getLatLng(mPrefecture.name, city, addressLine1);
        if (!geoloc) throw new GqlError({ code: "BAD_USER_INPUT", message: "Invalid address" });
    }

    const addressSelect = toAddressSelect(mapSelections(info)?.address)?.select;
    const updatedAddress = await store.address.update({
        where: { id },
        data: {
            addressLine1,
            addressLine2,
            city,
            latitude: geoloc.lat,
            longitude: geoloc.lng,
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
