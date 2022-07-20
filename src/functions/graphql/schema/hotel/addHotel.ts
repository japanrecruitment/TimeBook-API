import { IFieldResolver } from "@graphql-tools/utils";
import { S3Lib } from "@libs/S3";
import { Log } from "@utils/logger";
import { gql } from "apollo-server-core";
import { mapSelections } from "graphql-map-selections";
import { isEmpty } from "lodash";
import { Context } from "../../context";
import { GqlError } from "../../error";
import { AddAddressInput, validateAddAddressInput } from "../address";
import { ImageUploadInput, ImageUploadResult } from "../media";
import { HotelObject, toHotelSelect } from "./HotelObject";
import { AddHotelNearestStationInput, validateAddHotelNearestStationInputList } from "./nearest-stations";

function validateAddHotelInput(input: AddHotelInput): AddHotelInput {
    let { address, checkInTime, checkOutTime, description, name, nearestStations, photos } = input;

    description = description?.trim();
    name = name?.trim();

    if (isEmpty(description))
        throw new GqlError({ code: "BAD_USER_INPUT", message: "Hotel description cannot be empty" });

    if (isEmpty(name)) throw new GqlError({ code: "BAD_USER_INPUT", message: "Hotel name cannot be empty" });

    address = validateAddAddressInput(address);

    nearestStations = validateAddHotelNearestStationInputList(nearestStations);

    return { address, checkInTime, checkOutTime, description, name, nearestStations, photos };
}

type AddHotelInput = {
    name: string;
    description: string;
    checkInTime: string;
    checkOutTime: string;
    address: AddAddressInput;
    photos: ImageUploadInput[];
    nearestStations: AddHotelNearestStationInput[];
};

type AddHotelArgs = { input: AddHotelInput };

type AddHotelResult = {
    message: string;
    hotel?: HotelObject;
    uploadRes?: ImageUploadResult[];
};

type AddHotel = IFieldResolver<any, Context, AddHotelArgs, Promise<AddHotelResult>>;

const addHotel: AddHotel = async (_, { input }, { authData, dataSources, store }, info) => {
    const { accountId } = authData || {};
    if (!accountId) throw new GqlError({ code: "FORBIDDEN", message: "Invalid token!!" });

    const validInput = validateAddHotelInput(input);
    const { address, checkInTime, checkOutTime, description, name, nearestStations, photos } = validInput;

    const prefecture = await store.prefecture.findUnique({ where: { id: address.prefectureId } });
    if (!prefecture) throw new GqlError({ code: "BAD_USER_INPUT", message: "Invalid prefecture selected" });
    const geoloc = await dataSources.googleMap.getLatLng(prefecture.name, address.city, address.addressLine1);
    if (!geoloc) throw new GqlError({ code: "BAD_USER_INPUT", message: "Invalid address" });

    const hotelSelect = toHotelSelect(mapSelections(info).hotel)?.select;
    const hotel = await store.hotel.create({
        data: {
            checkInTime,
            checkOutTime,
            description,
            name,
            account: { connect: { id: accountId } },
            address: { create: { ...address, latitude: geoloc.lat, longitude: geoloc.lng } },
            nearestStations: { createMany: { data: nearestStations } },
            photos: { createMany: { data: photos.map(({ mime }) => ({ mime: mime || "image/jpeg", type: "Cover" })) } },
        },
        select: {
            ...hotelSelect,
            photos: true,
        },
    });

    const S3 = new S3Lib("upload");
    const uploadRes = hotel.photos
        ?.filter(({ medium, small, large }) => !medium && !small && !large)
        .map(({ id, mime, type }) => {
            const key = `${id}.${mime.split("/")[1]}`;
            const url = S3.getUploadUrl(key, mime, 60 * 10);
            return { key, mime, type, url };
        });

    Log(hotel, uploadRes);

    return {
        message: "Successfully added a hotel in a draft",
        hotel,
        uploadRes,
    };
};

export const addHotelTypeDefs = gql`
    input AddHotelInput {
        name: String!
        description: String!
        checkInTime: Time
        checkOutTime: Time
        address: AddAddressInput!
        photos: [ImageUploadInput]!
        nearestStations: [AddHotelNearestStationInput]!
    }

    type AddHotelResult {
        message: String!
        hotel: HotelObject
        uploadRes: [ImageUploadResult]
    }

    type Mutation {
        addHotel(input: AddHotelInput!): AddHotelResult! @auth(requires: [host])
    }
`;

export const addHotelResolvers = { Mutation: { addHotel } };
