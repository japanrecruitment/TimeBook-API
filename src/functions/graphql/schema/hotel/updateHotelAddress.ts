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
    if (!accountId) throw new GqlError({ code: "FORBIDDEN", message: "無効なリクエスト" });

    const validInput = validateUpdateAddressInput(input);
    const { id, addressLine1, addressLine2, city, postalCode, prefectureId } = validInput;

    const address = await store.address.findUnique({
        where: { id },
        include: { hotel: { select: { id: true, accountId: true, status: true } }, prefecture: true },
    });
    if (!address || !address.hotel) throw new GqlError({ code: "NOT_FOUND", message: "住所が見つかりません。" });
    if (accountId !== address.hotel.accountId) throw new GqlError({ code: "FORBIDDEN", message: "無効なリクエスト" });

    let mPrefecture = address.prefecture;
    if (prefectureId) {
        const prefecture = await store.prefecture.findFirst({ where: { id: prefectureId, available: true } });
        if (!prefecture) throw new GqlError({ code: "BAD_USER_INPUT", message: "無効な都道府県が選択されました" });
        mPrefecture = prefecture;
    }

    let geoloc: { lat: number; lng: number } = { lat: address.latitude, lng: address.longitude };
    if (
        (addressLine1 && address.addressLine1 !== addressLine1) ||
        (city && address.city !== city) ||
        (prefectureId && address.prefectureId !== prefectureId)
    ) {
        geoloc = await dataSources.googleMap.getLatLng(mPrefecture.name, city, addressLine1);
        if (!geoloc) throw new GqlError({ code: "BAD_USER_INPUT", message: "無効な住所" });
    }

    const addressSelect = toAddressSelect(mapSelections(info)?.address)?.select || { id: true };
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
        select: {
            ...addressSelect,
            city: true,
            latitude: true,
            longitude: true,
            prefecture: true,
            hotelId: true,
        },
    });

    Log(updatedAddress);
    if (
        address.hotel.status === "PUBLISHED" &&
        (updatedAddress.prefecture.id !== address.prefectureId ||
            updatedAddress.city !== address.city ||
            updatedAddress.latitude !== address.latitude ||
            updatedAddress.longitude !== address.longitude)
    ) {
        await dataSources.hotelAlgolia.partialUpdateObject({
            objectID: updatedAddress.hotelId,
            prefecture: updatedAddress.prefecture.name,
            city: updatedAddress.city,
            _geoloc: { lat: updatedAddress.latitude, lng: updatedAddress.longitude },
        });
    }

    return {
        message: "住所が更新しました。",
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
