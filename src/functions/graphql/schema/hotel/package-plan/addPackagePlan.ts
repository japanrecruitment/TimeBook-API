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
        additionalOptions,
        cutOffBeforeDays,
        description,
        endReservation,
        endUsage,
        includedOptions,
        name,
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

    if (!additionalOptions) additionalOptions = [];
    if (!includedOptions) includedOptions = [];

    if (!photos) photos = [];

    roomTypes = validateAddRoomTypesInPackagePlanInputList(roomTypes);

    return {
        additionalOptions,
        cutOffBeforeDays,
        description,
        endReservation,
        endUsage,
        includedOptions,
        name,
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
    isBreakfastIncluded: boolean;
    roomTypes: AddRoomTypesInPackagePlanInput[];
    photos: ImageUploadInput[];
    cancelPolicyId: string;
    includedOptions: string[];
    additionalOptions: string[];
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
        cancelPolicyId,
        cutOffBeforeDays,
        cutOffTillTime,
        description,
        endReservation,
        endUsage,
        isBreakfastIncluded,
        name,
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
        includedOptions: { select: { id: true } },
        additionalOptions: { select: { id: true } },
    };
    let packagePlan = await store.packagePlan.create({
        data: {
            description,
            isBreakfastIncluded,
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
            cancelPolicy: cancelPolicyId ? { connect: { id: cancelPolicyId } } : undefined,
            photos: { createMany: { data: photos.map(({ mime }) => ({ mime: mime || "image/jpeg", type: "Cover" })) } },
        },
        select: {
            ...packagePlanSelect,
            id: true,
            photos: true,
            roomTypes: false,
            includedOptions: false,
            additionalOptions: false,
        },
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

    let includedOptions = [];
    if (!isEmpty(validInput.includedOptions)) {
        includedOptions = await Promise.all(
            validInput.includedOptions.map((id) =>
                store.option.update({
                    where: { id: id },
                    data: { inPackagePlans: { connect: { id: packagePlan.id } } },
                    select: packagePlanSelect.includedOptions.select,
                })
            )
        );
    }

    let additionalOptions = [];
    if (!isEmpty(validInput.additionalOptions)) {
        additionalOptions = await Promise.all(
            validInput.additionalOptions.map((id) =>
                store.option.update({
                    where: { id: id },
                    data: { adPackagePlans: { connect: { id: packagePlan.id } } },
                    select: packagePlanSelect.additionalOptions.select,
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

    Log(packagePlan, includedOptions, additionalOptions, roomPlans, uploadRes);

    if (hotel.status === "PUBLISHED") {
        const hotel = await store.hotel.findUnique({
            where: { id: hotelId },
            select: {
                id: true,
                packagePlans: {
                    select: {
                        isBreakfastIncluded: true,
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
            isBreakfastIncluded: hotel.packagePlans.some(({ isBreakfastIncluded }) => isBreakfastIncluded),
        });
    }

    return {
        message: "Successfully added a package plan",
        packagePlan: { ...packagePlan, additionalOptions, includedOptions, roomTypes: roomPlans },
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
        isBreakfastIncluded: Boolean
        roomTypes: [AddRoomTypesInPackagePlanInput]
        photos: [ImageUploadInput]
        cancelPolicyId: ID
        includedOptions: [ID]
        additionalOptions: [ID]
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
