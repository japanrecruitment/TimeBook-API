import { IFieldResolver } from "@graphql-tools/utils";
import { S3Lib } from "@libs/S3";
import { HotelPaymentTerm } from "@prisma/client";
import { Log } from "@utils/logger";
import { gql } from "apollo-server-core";
import { mapSelections } from "graphql-map-selections";
import { Context } from "../../../context";
import { GqlError } from "../../../error";
import { ImageUploadInput, ImageUploadResult } from "../../media";
import { HotelRoomObject, toHotelRoomSelect } from "./HotelRoomObject";

function validateAddHotelInput(input: AddHotelRoomInput): AddHotelRoomInput {
    let { description, maxCapacityAdult, maxCapacityChild, name, paymentTerm, photos, stock } = input;

    description = description?.trim();
    name = name?.trim();

    if (!description) throw new GqlError({ code: "BAD_USER_INPUT", message: "Space description cannot be empty" });

    if (!name) throw new GqlError({ code: "BAD_USER_INPUT", message: "Space name cannot be empty" });

    if (maxCapacityAdult && maxCapacityAdult < 0)
        throw new GqlError({ code: "BAD_USER_INPUT", message: "Invalid maximum adult capacity" });

    if (maxCapacityChild && maxCapacityChild < 0)
        throw new GqlError({ code: "BAD_USER_INPUT", message: "Invalid maximum child capacity" });

    if (stock && stock < 0) throw new GqlError({ code: "BAD_USER_INPUT", message: "Invalid number of stock" });

    return { description, maxCapacityAdult, maxCapacityChild, name, paymentTerm, photos, stock };
}

type AddHotelRoomInput = {
    name: string;
    description: string;
    paymentTerm: HotelPaymentTerm;
    maxCapacityAdult: number;
    maxCapacityChild: number;
    stock: number;
    photos: ImageUploadInput[];
};

type AddHotelRoomArgs = { hotelId: string; input: AddHotelRoomInput };

type AddHotelRoomResult = {
    message: string;
    hotelRoom?: HotelRoomObject;
    uploadRes?: ImageUploadResult[];
};

type AddHotelRoom = IFieldResolver<any, Context, AddHotelRoomArgs, Promise<AddHotelRoomResult>>;

const addHotelRoom: AddHotelRoom = async (_, { hotelId, input }, { authData, store }, info) => {
    const { accountId } = authData || {};

    if (!accountId) throw new GqlError({ code: "FORBIDDEN", message: "Invalid token!!" });

    const validInput = validateAddHotelInput(input);
    const { description, maxCapacityAdult, maxCapacityChild, name, paymentTerm, photos, stock } = validInput;

    const hotel = await store.hotel.findUnique({ where: { id: hotelId } });
    if (!hotel) throw new GqlError({ code: "NOT_FOUND", message: "Hotel not found" });

    const hotelRoomSelect = toHotelRoomSelect(mapSelections(info).hotelRoom)?.select;
    const hotelRoom = await store.hotelRoom.create({
        data: {
            description,
            maxCapacityAdult,
            maxCapacityChild,
            name,
            paymentTerm,
            stock,
            hotel: { connect: { id: hotelId } },
            photos: { createMany: { data: photos.map(({ mime }) => ({ mime: mime || "image/jpeg", type: "Cover" })) } },
        },
        select: {
            ...hotelRoomSelect,
            photos: true,
        },
    });

    const S3 = new S3Lib("upload");
    const uploadRes = hotelRoom.photos
        ?.filter(({ medium, small, large }) => !medium && !small && !large)
        .map(({ id, mime, type }) => {
            const key = `${id}.${mime.split("/")[1]}`;
            const url = S3.getUploadUrl(key, mime, 60 * 10);
            return { key, mime, type, url };
        });

    Log(hotelRoom, uploadRes);

    return {
        message: "Successfully added a hotel room",
        hotelRoom,
        uploadRes,
    };
};

export const addHotelRoomTypeDefs = gql`
    input AddHotelRoomInput {
        name: String!
        description: String!
        paymentTerm: HotelPaymentTerm!
        maxCapacityAdult: Int
        maxCapacityChild: Int
        stock: Int
        photos: [ImageUploadInput]!
    }

    type AddHotelRoomResult {
        message: String!
        hotelRoom: HotelRoomObject
        uploadRes: [ImageUploadResult]
    }

    type Mutation {
        addHotelRoom(hotelId: ID!, input: AddHotelRoomInput!): AddHotelRoomResult! @auth(requires: [host])
    }
`;

export const addHotelRoomResolvers = { Mutation: { addHotelRoom } };