import { IFieldResolver } from "@graphql-tools/utils";
import { S3Lib } from "@libs/S3";
import { HotelPaymentTerm } from "@prisma/client";
import { Log } from "@utils/logger";
import { gql } from "apollo-server-core";
import { mapSelections } from "graphql-map-selections";
import { isEmpty, differenceWith } from "lodash";
import { Context } from "../../../context";
import { GqlError } from "../../../error";
import { ImageUploadInput, ImageUploadResult } from "../../media";
import {
    AddRoomTypesInPackagePlanInput,
    validateAddRoomTypesInPackagePlanInputList,
} from "./addRoomTypesInPackagePlan";
import { PackagePlanObject, toPackagePlanSelect } from "./PackagePlanObject";

function validateAddPackagePlanInput(input: AddPackagePlanInput): AddPackagePlanInput {
    let {
        cutOffBeforeDays,
        description,
        endReservation,
        endUsage,
        name,
        options,
        photos,
        roomTypes,
        startReservation,
        startUsage,
        stock,
        ...others
    } = input;

    description = description?.trim();
    name = name?.trim();

    if (isEmpty(description))
        throw new GqlError({ code: "BAD_USER_INPUT", message: "Plan description cannot be empty" });

    if (isEmpty(name)) throw new GqlError({ code: "BAD_USER_INPUT", message: "Plan name cannot be empty" });

    if (startUsage?.getTime() > endUsage?.getTime())
        throw new GqlError({ code: "BAD_USER_INPUT", message: "Invalid usage period" });

    if (startReservation?.getTime() > endReservation?.getTime())
        throw new GqlError({ code: "BAD_USER_INPUT", message: "Invalid reservation period" });

    if (cutOffBeforeDays && cutOffBeforeDays < 0)
        throw new GqlError({ code: "BAD_USER_INPUT", message: "Invalid cut off before days" });

    if (stock && stock < 0) throw new GqlError({ code: "BAD_USER_INPUT", message: "Invalid number of stock" });

    if (!options) options = [];

    if (!photos) photos = [];

    roomTypes = validateAddRoomTypesInPackagePlanInputList(roomTypes);

    return {
        cutOffBeforeDays,
        description,
        endReservation,
        endUsage,
        name,
        options,
        photos,
        roomTypes,
        startReservation,
        startUsage,
        stock,
        ...others,
    };
}

type AddPackagePlanInput = {
    name: string;
    description: string;
    paymentTerm: HotelPaymentTerm;
    stock: number;
    startUsage: Date;
    endUsage: Date;
    startReservation: Date;
    endReservation: Date;
    cutOffBeforeDays: number;
    cutOffTillTime: Date;
    roomTypes: AddRoomTypesInPackagePlanInput[];
    photos: ImageUploadInput[];
    options: string[];
};

type AddPackagePlanArgs = { hotelId: string; input: AddPackagePlanInput };

type AddPackagePlanResult = {
    message: string;
    packagePlan?: PackagePlanObject;
    uploadRes?: ImageUploadResult[];
};

type AddPackagePlan = IFieldResolver<any, Context, AddPackagePlanArgs, Promise<AddPackagePlanResult>>;

const addPackagePlan: AddPackagePlan = async (_, { hotelId, input }, { authData, dataSources, store }, info) => {
    const { accountId } = authData || {};
    if (!accountId) throw new GqlError({ code: "FORBIDDEN", message: "Invalid token!!" });

    const validInput = validateAddPackagePlanInput(input);
    const {
        cutOffBeforeDays,
        cutOffTillTime,
        description,
        endReservation,
        endUsage,
        name,
        options,
        paymentTerm,
        roomTypes,
        photos,
        startReservation,
        startUsage,
        stock,
    } = validInput;

    const hotel = await store.hotel.findFirst({
        where: { id: hotelId, accountId },
        select: { priceSchemes: { select: { id: true } }, rooms: { select: { id: true } }, status: true },
    });
    if (!hotel) throw new GqlError({ code: "NOT_FOUND", message: "Hotel not found" });
    differenceWith(roomTypes, hotel.rooms, ({ hotelRoomId }, { id }) => hotelRoomId === id).forEach(
        ({ hotelRoomId }) => {
            throw new GqlError({ code: "NOT_FOUND", message: `Hotel doesn't have room with id: ${hotelRoomId}` });
        }
    );
    differenceWith(
        roomTypes.flatMap(({ priceSettings }) => priceSettings.filter(({ priceSchemeId }) => priceSchemeId)),
        hotel.priceSchemes,
        ({ priceSchemeId }, { id }) => priceSchemeId === id
    ).forEach(({ priceSchemeId }) => {
        throw new GqlError({ code: "NOT_FOUND", message: `Hotel doesn't have price scheme with id: ${priceSchemeId}` });
    });

    const packagePlanSelect = toPackagePlanSelect(mapSelections(info).packagePlan)?.select || {
        id: true,
        roomTypes: { select: { id: true } },
        optionsAttachments: { select: { id: true } },
    };
    let packagePlan = await store.packagePlan.create({
        data: {
            description,
            name,
            paymentTerm,
            cutOffBeforeDays,
            cutOffTillTime,
            endReservation,
            endUsage,
            startReservation,
            startUsage,
            stock,
            hotel: { connect: { id: hotelId } },
            photos: { createMany: { data: photos.map(({ mime }) => ({ mime: mime || "image/jpeg", type: "Cover" })) } },
        },
        select: { ...packagePlanSelect, id: true, photos: true, roomTypes: false, optionsAttachments: false },
    });

    const roomPlans = await Promise.all(
        roomTypes.map(({ hotelRoomId, priceSettings }) =>
            store.hotelRoom_PackagePlan.create({
                data: {
                    hotelRoom: { connect: { id: hotelRoomId } },
                    packagePlan: { connect: { id: packagePlan.id } },
                    priceSettings: { createMany: { data: priceSettings } },
                },
                select: { ...packagePlanSelect.roomTypes.select, packagePlan: false },
            })
        )
    );

    let optionsAttachments = [];
    if (!isEmpty(options)) {
        optionsAttachments = await Promise.all(
            options.map((id) =>
                store.option.update({
                    where: { id: id },
                    data: { packagePlans: { connect: { id: packagePlan.id } } },
                    select: packagePlanSelect.optionsAttachments.select,
                })
            )
        );
    }

    const S3 = new S3Lib("upload");
    const uploadRes = packagePlan.photos
        ?.filter(({ medium, small, large }) => !medium && !small && !large)
        .map(({ id, mime, type }) => {
            const key = `${id}.${mime.split("/")[1]}`;
            const url = S3.getUploadUrl(key, mime, 60 * 10);
            return { key, mime, type, url };
        });

    Log(packagePlan, optionsAttachments, roomPlans, uploadRes);

    if (hotel.status === "PUBLISHED") {
        const hotel = await store.hotel.findUnique({
            where: { id: hotelId },
            select: {
                id: true,
                packagePlans: {
                    select: {
                        paymentTerm: true,
                        roomTypes: { select: { priceSettings: { select: { priceScheme: true } } } },
                    },
                },
                status: true,
            },
        });
        let highestPrice = 0;
        let lowestPrice = 0;
        hotel.packagePlans.forEach(({ paymentTerm, roomTypes }) => {
            const selector = paymentTerm === "PER_PERSON" ? "oneAdultCharge" : "roomCharge";
            roomTypes.forEach(({ priceSettings }, index) => {
                priceSettings.forEach(({ priceScheme }) => {
                    if (index === 0) lowestPrice = priceScheme[selector];
                    if (priceScheme[selector] > highestPrice) highestPrice = priceScheme[selector];
                    if (priceScheme[selector] < lowestPrice) lowestPrice = priceScheme[selector];
                });
            });
        });
        await dataSources.hotelAlgolia.partialUpdateObject({
            objectID: hotel.id,
            highestPrice,
            lowestPrice,
        });
    }

    return {
        message: "Successfully added a package plan",
        packagePlan: { ...packagePlan, optionsAttachments, roomTypes: roomPlans },
        uploadRes,
    };
};

export const addPackagePlanTypeDefs = gql`
    input AddPackagePlanInput {
        name: String!
        description: String!
        paymentTerm: HotelPaymentTerm!
        stock: Int!
        startUsage: Date
        endUsage: Date
        startReservation: Date
        endReservation: Date
        cutOffBeforeDays: Int
        cutOffTillTime: Time
        roomTypes: [AddRoomTypesInPackagePlanInput]
        photos: [ImageUploadInput]
        options: [ID]
    }

    type AddPackagePlanResult {
        message: String!
        packagePlan: PackagePlanObject
        uploadRes: [ImageUploadResult]
    }

    type Mutation {
        addPackagePlan(hotelId: ID!, input: AddPackagePlanInput!): AddPackagePlanResult! @auth(requires: [host])
    }
`;

export const addPackagePlanResolvers = { Mutation: { addPackagePlan } };
