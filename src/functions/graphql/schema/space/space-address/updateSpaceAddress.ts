import { IFieldResolver } from "@graphql-tools/utils";
import { Log } from "@utils/logger";
import { gql } from "apollo-server-core";
import axios from "axios";
import { GqlError } from "src/functions/graphql/error";
import { Context } from "../../../context";
import { UpdateAddressInput } from "../../address";
import { Result } from "../../core/result";

type UpdateSpaceAddressArgs = { spaceId: string; address: UpdateAddressInput };

type UpdateSpaceAddressResult = Promise<Result>;

type UpdateSpaceAddress = IFieldResolver<any, Context, UpdateSpaceAddressArgs, UpdateSpaceAddressResult>;

const updateSpaceAddress: UpdateSpaceAddress = async (_, { spaceId, address }, { authData, dataSources, store }) => {
    const { accountId } = authData;
    const { id, addressLine1, addressLine2, city, postalCode, prefectureId } = address;

    const space = await store.space.findFirst({
        where: { id: spaceId, isDeleted: false, address: { id } },
        select: {
            accountId: true,
            published: true,
            address: {
                select: {
                    addressLine1: true,
                    city: true,
                    latitude: true,
                    longitude: true,
                    prefectureId: true,
                    prefecture: true,
                },
            },
        },
    });

    if (!space) throw new GqlError({ code: "NOT_FOUND", message: "指定された住所のスペースが見つかりません" });

    if (accountId !== space.accountId) throw new GqlError({ code: "FORBIDDEN", message: "無効なリクエスト" });

    if (addressLine1?.trim() === "")
        throw new GqlError({ code: "BAD_USER_INPUT", message: "住所行 1 を空にすることはできません" });

    if (city?.trim() === "") throw new GqlError({ code: "BAD_USER_INPUT", message: "街を空にすることはできない" });

    if (postalCode?.trim() === "")
        throw new GqlError({ code: "BAD_USER_INPUT", message: "郵便番号を空白にすることはできません" });

    let mPrefecture = space.address.prefecture;
    if (prefectureId) {
        const prefecture = await store.prefecture.findUnique({ where: { id: prefectureId } });
        if (!prefecture)
            throw new GqlError({ code: "BAD_USER_INPUT", message: "都道府県を空白にすることはできません" });
        mPrefecture = prefecture;
    }

    let geoloc: { lat: number; lng: number } = { lat: space.address.latitude, lng: space.address.longitude };
    if (
        (addressLine1 && space.address.addressLine1 !== addressLine1) ||
        (city && space.address.city !== city) ||
        (prefectureId && space.address.prefectureId !== prefectureId)
    ) {
        geoloc = await dataSources.googleMap.getLatLng(mPrefecture.name, city, addressLine1);
        if (!geoloc) throw new GqlError({ code: "BAD_USER_INPUT", message: "無効な住所" });
    }

    const updatedAddress = await store.address.update({
        where: { id },
        data: {
            addressLine1: addressLine1?.trim(),
            addressLine2: addressLine2?.trim(),
            city: city?.trim(),
            latitude: geoloc?.lat,
            longitude: geoloc?.lng,
            postalCode: postalCode?.trim(),
            prefecture: prefectureId ? { connect: { id: prefectureId } } : undefined,
        },
        select: {
            city: true,
            latitude: true,
            longitude: true,
            prefecture: { select: { id: true, name: true } },
            spaceId: true,
        },
    });

    Log(updatedAddress);

    if (
        space.published &&
        (updatedAddress.prefecture.id !== space.address.prefectureId ||
            updatedAddress.city !== space.address.city ||
            updatedAddress.latitude !== space.address.latitude ||
            updatedAddress.longitude !== space.address.longitude)
    ) {
        // get address prefecture and city from postalcode
        const postalCodePrefix = postalCode.slice(0, 3);
        const { data } = await axios.get(`https://yubinbango.github.io/yubinbango-data/data/${postalCodePrefix}.js`);
        const postalCodeData = JSON.parse(data.trim().slice(7, data.length - 3));
        const address = postalCodeData[postalCode];

        await dataSources.spaceAlgolia.partialUpdateObject({
            objectID: updatedAddress.spaceId,
            prefecture: updatedAddress.prefecture.name,
            city: address[1],
            _geoloc: { lat: updatedAddress.latitude, lng: updatedAddress.longitude },
        });
    }

    return { message: `住所が更新されました` };
};

export const updateSpaceAddressTypeDefs = gql`
    type Mutation {
        updateSpaceAddress(spaceId: ID!, address: UpdateAddressInput!): Result! @auth(requires: [user, host])
    }
`;

export const updateSpaceAddressResolvers = {
    Mutation: { updateSpaceAddress },
};
