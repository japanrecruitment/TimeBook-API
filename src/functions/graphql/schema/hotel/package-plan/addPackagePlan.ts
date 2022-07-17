import { IFieldResolver } from "@graphql-tools/utils";
import { S3Lib } from "@libs/S3";
import { HotelPaymentTerm, PhotoType } from "@prisma/client";
import { Log } from "@utils/logger";
import { gql } from "apollo-server-core";
import { mapSelections } from "graphql-map-selections";
import { isEmpty, differenceWith } from "lodash";
import { Context } from "../../../context";
import { GqlError } from "../../../error";
import { ImageUploadInput, ImageUploadResult } from "../../media";
import { AddBasicPriceSettingInput, validateAddBasicPriceSettingInputList } from "../basic-price-setting";
import { PackagePlanObject, toPackagePlanSelect } from "./PackagePlanObject";

function validateAddPackagePlanInput(input: AddPackagePlanInput): AddPackagePlanInput {
    let {
        cutOffBeforeDays,
        description,
        endReservation,
        endUsage,
        hotelRoomPlans,
        name,
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

    hotelRoomPlans = hotelRoomPlans.map(({ hotelRoomId, priceSettings }) => {
        return {
            hotelRoomId,
            priceSettings: validateAddBasicPriceSettingInputList(priceSettings),
            stock,
        };
    });

    return {
        cutOffBeforeDays,
        description,
        endReservation,
        endUsage,
        hotelRoomPlans,
        name,
        startReservation,
        startUsage,
        stock,
        ...others,
    };
}

type PackagePlan_HotelRoomPlanInput = {
    hotelRoomId: string;
    priceSettings: AddBasicPriceSettingInput[];
};

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
    hotelRoomPlans: PackagePlan_HotelRoomPlanInput[];
    photos: ImageUploadInput[];
};

type AddPackagePlanArgs = { hotelId: string; input: AddPackagePlanInput };

type AddPackagePlanResult = {
    message: string;
    packagePlan?: PackagePlanObject;
    uploadRes?: ImageUploadResult[];
};

type AddPackagePlan = IFieldResolver<any, Context, AddPackagePlanArgs, Promise<AddPackagePlanResult>>;

const addPackagePlan: AddPackagePlan = async (_, { hotelId, input }, { authData, store }, info) => {
    const { accountId } = authData || {};
    if (!accountId) throw new GqlError({ code: "FORBIDDEN", message: "Invalid token!!" });

    const validInput = validateAddPackagePlanInput(input);
    const {
        cutOffBeforeDays,
        cutOffTillTime,
        description,
        endReservation,
        endUsage,
        hotelRoomPlans,
        name,
        paymentTerm,
        photos,
        startReservation,
        startUsage,
        stock,
    } = validInput;

    const hotel = await store.hotel.findFirst({
        where: { id: hotelId, accountId },
        select: { rooms: { select: { id: true } }, priceSchemes: { select: { id: true } } },
    });
    if (!hotel) throw new GqlError({ code: "NOT_FOUND", message: "Hotel not found" });
    differenceWith(hotelRoomPlans, hotel.rooms, ({ hotelRoomId }, { id }) => hotelRoomId === id).forEach(
        ({ hotelRoomId }) => {
            throw new GqlError({ code: "NOT_FOUND", message: `Hotel doesn't have room with id: ${hotelRoomId}` });
        }
    );
    differenceWith(
        hotelRoomPlans.flatMap(({ priceSettings }) => priceSettings.filter(({ priceSchemeId }) => priceSchemeId)),
        hotel.priceSchemes,
        ({ priceSchemeId }, { id }) => priceSchemeId === id
    ).forEach(({ priceSchemeId }) => {
        throw new GqlError({ code: "NOT_FOUND", message: `Hotel doesn't have price scheme with id: ${priceSchemeId}` });
    });

    const packagePlanSelect = toPackagePlanSelect(mapSelections(info).packagePlan)?.select;
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
        select: { ...packagePlanSelect, id: true, hotelRoomPlans: false },
    });

    const roomPlans = await Promise.all(
        hotelRoomPlans.map(({ hotelRoomId, priceSettings }) =>
            store.hotelRoomPlan.create({
                data: {
                    hotelRoom: { connect: { id: hotelRoomId } },
                    packagePlan: { connect: { id: packagePlan.id } },
                    priceSettings: { createMany: { data: priceSettings } },
                },
                select: { ...packagePlanSelect.hotelRoomPlans.select, packagePlan: false },
            })
        )
    );

    const S3 = new S3Lib("upload");
    const uploadRes = packagePlan.photos
        ?.filter(({ medium, small, large }) => !medium && !small && !large)
        .map(({ id, mime, type }) => {
            const key = `${id}.${mime.split("/")[1]}`;
            const url = S3.getUploadUrl(key, mime, 60 * 10);
            return { key, mime, type, url };
        });

    Log(packagePlan, roomPlans, uploadRes);

    return {
        message: "Successfully added a package plan",
        packagePlan: { ...packagePlan, hotelRoomPlans: roomPlans },
        uploadRes,
    };
};

export const addPackagePlanTypeDefs = gql`
    input PackagePlan_HotelRoomPlanInput {
        hotelRoomId: ID!
        priceSettings: [AddBasicPriceSettingInput]!
    }

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
        hotelRoomPlans: [PackagePlan_HotelRoomPlanInput]!
        photos: [ImageUploadInput]!
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