import { IFieldResolver } from "@graphql-tools/utils";
import { S3Lib } from "@libs/S3";
import { HotelPaymentTerm } from "@prisma/client";
import { Log } from "@utils/logger";
import { gql } from "apollo-server-core";
import { mapSelections } from "graphql-map-selections";
import { isEmpty } from "lodash";
import { Context } from "../../../context";
import { GqlError } from "../../../error";
import { ImageUploadInput, ImageUploadResult } from "../../media";
import { AddBasicPriceSettingInput, validateAddBasicPriceSettingInputList } from "../basic-price-setting";
import { HotelRoomObject, toHotelRoomSelect } from "./HotelRoomObject";

function validateAddHotelInput(input: AddHotelRoomInput): AddHotelRoomInput {
    let { basicPriceSettings, description, maxCapacityAdult, maxCapacityChild, name, paymentTerm, photos, stock } =
        input;

    description = description?.trim();
    name = name?.trim();

    if (isEmpty(description))
        throw new GqlError({ code: "BAD_USER_INPUT", message: "Hotel description cannot be empty" });

    if (isEmpty(name)) throw new GqlError({ code: "BAD_USER_INPUT", message: "Hotel name cannot be empty" });

    if (maxCapacityAdult && maxCapacityAdult < 0)
        throw new GqlError({ code: "BAD_USER_INPUT", message: "Invalid maximum adult capacity" });

    if (maxCapacityChild && maxCapacityChild < 0)
        throw new GqlError({ code: "BAD_USER_INPUT", message: "Invalid maximum child capacity" });

    if (stock && stock < 0) throw new GqlError({ code: "BAD_USER_INPUT", message: "Invalid number of stock" });

    basicPriceSettings = validateAddBasicPriceSettingInputList(basicPriceSettings);

    return { basicPriceSettings, description, maxCapacityAdult, maxCapacityChild, name, paymentTerm, photos, stock };
}

type AddHotelRoomInput = {
    name: string;
    description: string;
    paymentTerm: HotelPaymentTerm;
    maxCapacityAdult: number;
    maxCapacityChild: number;
    stock: number;
    basicPriceSettings: AddBasicPriceSettingInput[];
    photos: ImageUploadInput[];
};

type AddHotelRoomArgs = { hotelId: string; input: AddHotelRoomInput };

type AddHotelRoomResult = {
    message: string;
    hotelRoom?: HotelRoomObject;
    uploadRes?: ImageUploadResult[];
};

type AddHotelRoom = IFieldResolver<any, Context, AddHotelRoomArgs, Promise<AddHotelRoomResult>>;

const addHotelRoom: AddHotelRoom = async (_, { hotelId, input }, { authData, dataSources, store }, info) => {
    const { accountId } = authData || {};
    if (!accountId) throw new GqlError({ code: "FORBIDDEN", message: "Invalid token!!" });

    const validInput = validateAddHotelInput(input);
    const { basicPriceSettings, description, maxCapacityAdult, maxCapacityChild, name, paymentTerm, photos, stock } =
        validInput;

    const hotel = await store.hotel.findFirst({ where: { id: hotelId, accountId } });
    if (!hotel) throw new GqlError({ code: "NOT_FOUND", message: "Hotel not found" });

    const hotelRoomSelect = toHotelRoomSelect(mapSelections(info).hotelRoom)?.select || { id: true };
    const hotelRoom = await store.hotelRoom.create({
        data: {
            description,
            maxCapacityAdult,
            maxCapacityChild,
            name,
            paymentTerm,
            stock,
            hotel: { connect: { id: hotelId } },
            basicPriceSettings: { createMany: { data: basicPriceSettings } },
            photos: { createMany: { data: photos.map(({ mime }) => ({ mime: mime || "image/jpeg", type: "Cover" })) } },
        },
        select: {
            ...hotelRoomSelect,
            photos: true,
            hotel: {
                select: {
                    id: true,
                    rooms: { select: { name: true, maxCapacityAdult: true, maxCapacityChild: true } },
                    status: true,
                },
            },
        },
    });

    if (hotelRoom.hotel.status === "PUBLISHED") {
        let maxAdult = 0;
        let maxChild = 0;
        hotelRoom.hotel.rooms.forEach(({ maxCapacityAdult, maxCapacityChild }) => {
            if (maxCapacityAdult > maxAdult) maxAdult = maxCapacityAdult;
            if (maxCapacityChild > maxChild) maxChild = maxCapacityAdult;
        });
        await dataSources.hotelAlgolia.partialUpdateObject({
            objectID: hotelRoom.hotel.id,
            hotelRooms: hotelRoom.hotel.rooms.map(({ name }) => name),
            maxAdult,
            maxChild,
        });
    }

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
        basicPriceSettings: [AddBasicPriceSettingInput]!
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
