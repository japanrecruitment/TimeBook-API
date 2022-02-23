import { IFieldResolver } from "@graphql-tools/utils";
import { Log } from "@utils/logger";
import { gql } from "apollo-server-core";
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

    if (!space) throw new GqlError({ code: "NOT_FOUND", message: "Space with the given address not found" });

    if (accountId !== space.accountId)
        throw new GqlError({ code: "FORBIDDEN", message: "You are not allowed to modify this space" });

    if (addressLine1?.trim() === "")
        throw new GqlError({ code: "BAD_USER_INPUT", message: "Address line 1 cannot be empty" });

    if (city?.trim() === "") throw new GqlError({ code: "BAD_USER_INPUT", message: "City cannot be empty" });

    if (postalCode?.trim() === "")
        throw new GqlError({ code: "BAD_USER_INPUT", message: "Postal code cannot be empty" });

    let mPrefecture = space.address.prefecture;
    if (prefectureId) {
        const prefecture = await store.prefecture.findUnique({ where: { id: prefectureId } });
        if (!prefecture) throw new GqlError({ code: "BAD_USER_INPUT", message: "Invalid prefecture selected" });
        mPrefecture = prefecture;
    }

    let geoloc: { lat: number; lng: number };
    if (
        (addressLine1 && space.address.addressLine1 !== addressLine1) ||
        (city && space.address.city !== city) ||
        (prefectureId && space.address.prefectureId !== prefectureId)
    ) {
        geoloc = await dataSources.googleMap.getLatLng(mPrefecture.name, city, addressLine1);
        if (!geoloc) throw new GqlError({ code: "BAD_USER_INPUT", message: "Invalid address" });
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
        await dataSources.spaceAlgolia.partialUpdateObject({
            objectID: updatedAddress.spaceId,
            prefecture: updatedAddress.prefecture.name,
            city: updatedAddress.city,
            _geoloc: { lat: updatedAddress.latitude, lng: updatedAddress.longitude },
        });
    }

    return { message: `Successfully updated address in your space` };
};

export const updateSpaceAddressTypeDefs = gql`
    type Mutation {
        updateSpaceAddress(spaceId: ID!, address: UpdateAddressInput!): Result! @auth(requires: [user, host])
    }
`;

export const updateSpaceAddressResolvers = {
    Mutation: { updateSpaceAddress },
};
