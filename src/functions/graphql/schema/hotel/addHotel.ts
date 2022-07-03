import { IFieldResolver } from "@graphql-tools/utils";
import { S3Lib } from "@libs/S3";
import { Log } from "@utils/logger";
import { gql } from "apollo-server-core";
import { mapSelections } from "graphql-map-selections";
import { Context } from "../../context";
import { GqlError } from "../../error";
import { AddAddressInput, validateAddAddressInput } from "../address";
import { ImageUploadInput, ImageUploadResult } from "../media";
import { HotelObject, toHotelSelect } from "./HotelObject";
import { AddHotelNearestStationInput, validateHotelNearestStationInputList } from "./nearest-stations";

function validateAddHotelInput(input: AddHotelInput): AddHotelInput {
    let { address, checkInTime, checkOutTime, description, name, nearestStations, photos } = input;

    description = description?.trim();
    name = name?.trim();

    if (!description) throw new GqlError({ code: "BAD_USER_INPUT", message: "Space description cannot be empty" });

    if (!name) throw new GqlError({ code: "BAD_USER_INPUT", message: "Space name cannot be empty" });

    address = validateAddAddressInput(address);

    nearestStations = validateHotelNearestStationInputList(nearestStations);

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

const addHotel: AddHotel = async (_, { input }, { authData, store }, info) => {
    const { accountId } = authData || {};

    if (!accountId) throw new GqlError({ code: "FORBIDDEN", message: "Invalid token!!" });

    const validInput = validateAddHotelInput(input);
    const { address, checkInTime, checkOutTime, description, name, nearestStations, photos } = validInput;

    const hotelSelect = toHotelSelect(mapSelections(info).hotel)?.select;

    const hotel = await store.hotel.create({
        data: {
            checkInTime,
            checkOutTime,
            description,
            name,
            account: { connect: { id: accountId } },
            address: { create: address },
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