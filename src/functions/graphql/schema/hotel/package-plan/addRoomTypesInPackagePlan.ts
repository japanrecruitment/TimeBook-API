import { IFieldResolver } from "@graphql-tools/utils";
import { Log } from "@utils/logger";
import { gql } from "apollo-server-core";
import { mapSelections } from "graphql-map-selections";
import { compact, differenceWith } from "lodash";
import { Context } from "../../../context";
import { GqlError } from "../../../error";
import { AddBasicPriceSettingInput, validateAddBasicPriceSettingInputList } from "../basic-price-setting";
import { PackagePlanRoomTypeObject, toPackagePlanRoomTypeSelect } from "./PackagePlanRoomTypeObject";

function validateAddRoomTypesInPackagePlanInput(input: AddRoomTypesInPackagePlanInput): AddRoomTypesInPackagePlanInput {
    let { hotelRoomId, priceSettings } = input;
    priceSettings = validateAddBasicPriceSettingInputList(priceSettings);
    return { hotelRoomId, priceSettings };
}

export function validateAddRoomTypesInPackagePlanInputList(
    input: AddRoomTypesInPackagePlanInput[]
): AddRoomTypesInPackagePlanInput[] {
    if (!input) return [];
    return compact(input.map(validateAddRoomTypesInPackagePlanInput));
}

export type AddRoomTypesInPackagePlanInput = {
    hotelRoomId: string;
    priceSettings: AddBasicPriceSettingInput[];
};

type AddRoomTypesInPackagePlanArgs = {
    packagePlanId: string;
    roomTypes: AddRoomTypesInPackagePlanInput[];
};

type AddRoomTypesInPackagePlanResult = {
    message: string;
    roomTypes?: PackagePlanRoomTypeObject[];
};

type AddRoomTypesInPackagePlan = IFieldResolver<
    any,
    Context,
    AddRoomTypesInPackagePlanArgs,
    Promise<AddRoomTypesInPackagePlanResult>
>;

const addRoomTypesInPackagePlan: AddRoomTypesInPackagePlan = async (
    _,
    { packagePlanId, roomTypes },
    { authData, dataSources, store },
    info
) => {
    const { accountId } = authData || {};
    if (!accountId) throw new GqlError({ code: "FORBIDDEN", message: "Invalid token!!" });

    const validRoomTypes = validateAddRoomTypesInPackagePlanInputList(roomTypes);

    const packagePlan = await store.packagePlan.findUnique({
        where: { id: packagePlanId },
        select: {
            hotel: { select: { accountId: true, id: true, status: true } },
            roomTypes: { select: { hotelRoomId: true } },
        },
    });
    if (!packagePlan || !packagePlan.hotel)
        throw new GqlError({ code: "NOT_FOUND", message: "Package plan not found" });
    if (accountId !== packagePlan.hotel.accountId)
        throw new GqlError({ code: "FORBIDDEN", message: "You are not allowed to modify this hotel package plan" });

    const hotelRooms = await store.hotelRoom.findMany({
        where: { id: { in: validRoomTypes.map(({ hotelRoomId }) => hotelRoomId) } },
        select: { id: true },
    });
    differenceWith(validRoomTypes, hotelRooms, ({ hotelRoomId }, { id }) => hotelRoomId === id).forEach(
        ({ hotelRoomId }) => {
            throw new GqlError({
                code: "NOT_FOUND",
                message: `Hotel room with id ${hotelRoomId} not found!`,
            });
        }
    );

    const roomTypesToAdd = differenceWith(
        validRoomTypes,
        packagePlan.roomTypes,
        (a, b) => a.hotelRoomId === b.hotelRoomId
    );

    if (roomTypesToAdd.length <= 0)
        throw new GqlError({ message: `No new room type found from submitted list to add` });

    const packagePlanRoomTypeSelect = toPackagePlanRoomTypeSelect(mapSelections(info)?.roomTypes)?.select || {
        id: true,
    };
    const newRoomTypes = await Promise.all(
        roomTypesToAdd.map(({ hotelRoomId, priceSettings }) =>
            store.hotelRoom_PackagePlan.create({
                data: {
                    hotelRoom: { connect: { id: hotelRoomId } },
                    packagePlan: { connect: { id: packagePlanId } },
                    priceSettings: { createMany: { data: priceSettings } },
                },
                select: { ...packagePlanRoomTypeSelect, packagePlan: false },
            })
        )
    );

    Log(newRoomTypes);

    if (packagePlan.hotel.status === "PUBLISHED") {
        const hotel = await store.hotel.findUnique({
            where: { id: packagePlan.hotel.id },
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
        message: `Successfully added room type is package plan`,
        roomTypes: newRoomTypes,
    };
};

export const addRoomTypesInPackagePlanTypeDefs = gql`
    input AddRoomTypesInPackagePlanInput {
        hotelRoomId: ID!
        priceSettings: [AddBasicPriceSettingInput]!
    }

    type AddRoomTypesInPackagePlanResult {
        message: String!
        roomTypes: [PackagePlanRoomTypeObject]
    }

    type Mutation {
        addRoomTypesInPackagePlan(
            packagePlanId: ID!
            roomTypes: [AddRoomTypesInPackagePlanInput]!
        ): AddRoomTypesInPackagePlanResult @auth(requires: [host])
    }
`;

export const addRoomTypesInPackagePlanResolvers = { Mutation: { addRoomTypesInPackagePlan } };
