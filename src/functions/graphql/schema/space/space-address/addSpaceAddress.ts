import { IFieldResolver } from "@graphql-tools/utils";
import { gql } from "apollo-server-core";
import axios from "axios";
import { mapSelections } from "graphql-map-selections";
import { merge } from "lodash";
import { GqlError } from "src/functions/graphql/error";
import { Context } from "../../../context";
import { AddAddressInput, AddressObject, toAddressSelect } from "../../address";
import { Result } from "../../core/result";

type AddSpaceAddressArgs = { spaceId: string; address: AddAddressInput };

type AddSpaceAddressResult = { address: AddressObject; result: Result };

type AddSpaceAddress = IFieldResolver<any, Context, AddSpaceAddressArgs, Promise<AddSpaceAddressResult>>;

const addSpaceAddress: AddSpaceAddress = async (_, { spaceId, address }, { authData, dataSources, store }, info) => {
    const { accountId } = authData;
    const { addressLine1, addressLine2, city, postalCode, prefectureId } = address;

    const space = await store.space.findFirst({
        where: { id: spaceId, isDeleted: false },
        select: { accountId: true, published: true },
    });

    if (!space) throw new GqlError({ code: "NOT_FOUND", message: "スペースが見つかりません" });

    if (accountId !== space.accountId) throw new GqlError({ code: "FORBIDDEN", message: "無効なリクエスト" });

    if (addressLine1?.trim() === "")
        throw new GqlError({ code: "BAD_USER_INPUT", message: "住所行 1 を空にすることはできません" });

    if (city?.trim() === "") throw new GqlError({ code: "BAD_USER_INPUT", message: "街を空にすることはできない" });

    if (postalCode?.trim() === "")
        throw new GqlError({ code: "BAD_USER_INPUT", message: "郵便番号を空白にすることはできません" });

    if (!prefectureId) throw new GqlError({ code: "BAD_USER_INPUT", message: "都道府県を空白にすることはできません" });

    const prefecture = await store.prefecture.findUnique({ where: { id: prefectureId } });

    if (!prefecture) throw new GqlError({ code: "BAD_USER_INPUT", message: "無効な都道府県が選択されました" });

    const geoloc = await dataSources.googleMap.getLatLng(prefecture.name, city, addressLine1);
    if (!geoloc) throw new GqlError({ code: "BAD_USER_INPUT", message: "無効な住所" });

    const newAddress = await store.address.create({
        data: {
            addressLine1: addressLine1?.trim(),
            addressLine2: addressLine2?.trim(),
            city: city?.trim(),
            latitude: geoloc.lat,
            longitude: geoloc.lng,
            postalCode: postalCode?.trim(),
            prefecture: { connect: { id: prefectureId } },
            space: { connect: { id: spaceId } },
        },
        ...merge(toAddressSelect(mapSelections(info).address), {
            select: { id: true, prefecture: { select: { name: true } }, spaceId: true },
        }),
    });

    if (space.published) {
        // get address prefecture and city from postalcode
        const postalCodePrefix = postalCode.slice(0, 3);
        const { data } = await axios.get(`https://yubinbango.github.io/yubinbango-data/data/${postalCodePrefix}.js`);
        const postalCodeData = JSON.parse(data.trim().slice(7, data.length - 3));
        const address = postalCodeData[postalCode];

        await dataSources.spaceAlgolia.partialUpdateObject({
            objectID: newAddress.spaceId,
            prefecture: newAddress.prefecture.name,
            city: address[1],
            _geoloc: { lat: newAddress.latitude, lng: newAddress.longitude },
        });
    }

    return { address: newAddress, result: { message: `アドレスが追加されました` } };
};

export const addSpaceAddressTypeDefs = gql`
    type AddSpaceAddressResult {
        result: Result
        address: AddressObject
    }

    type Mutation {
        addSpaceAddress(spaceId: ID!, address: AddAddressInput!): AddSpaceAddressResult! @auth(requires: [user, host])
    }
`;

export const addSpaceAddressResolvers = {
    Mutation: { addSpaceAddress },
};
