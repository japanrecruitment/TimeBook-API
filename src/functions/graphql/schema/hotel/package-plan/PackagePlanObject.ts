import { PackagePlan, Prisma } from "@prisma/client";
import { omit } from "@utils/object-helper";
import { gql } from "apollo-server-core";
import { PrismaSelect } from "graphql-map-selections";
import { isEmpty } from "lodash";
import { Photo, PhotoSelect, toPhotoSelect } from "../../media";
import { OptionObject, OptionSelect, toOptionSelect } from "../../options";
import {
    PackagePlanRoomTypeObject,
    PackagePlanRoomTypeSelect,
    toPackagePlanRoomTypeSelect,
} from "./PackagePlanRoomTypeObject";

export type PackagePlanObject = Partial<PackagePlan> & {
    photos?: Partial<Photo>[];
    roomTypes?: Partial<PackagePlanRoomTypeObject>[];
    includedOptions?: Partial<OptionObject>[];
    addtionalOptions?: Partial<OptionObject>[];
};

export type PackagePlanSelect = {
    id: boolean;
    name: boolean;
    description: boolean;
    paymentTerm: boolean;
    stock: boolean;
    startUsage: boolean;
    endUsage: boolean;
    startReservation: boolean;
    endReservation: boolean;
    cutOffBeforeDays: boolean;
    cutOffTillTime: boolean;
    isBreakfastIncluded: boolean;
    hotelId: boolean;
    photos: PrismaSelect<PhotoSelect>;
    roomTypes: PrismaSelect<PackagePlanRoomTypeSelect> & { orderBy: { createdAt: Prisma.SortOrder } };
    includedOptions: PrismaSelect<OptionSelect>;
    addtionalOptions: PrismaSelect<OptionSelect>;
    createdAt: boolean;
    updatedAt: boolean;
};

export function toPackagePlanSelect(selections, defaultValue: any = false): PrismaSelect<PackagePlanSelect> {
    if (!selections || isEmpty(selections)) return defaultValue;
    const photosSelect = toPhotoSelect(selections.photos);
    const roomTypeSelect = toPackagePlanRoomTypeSelect(selections.roomTypes)?.select;
    const includedOptionSelect = toOptionSelect(selections.includedOptions);
    const additionalOptionSelect = toOptionSelect(selections.addtionalOptions);
    const packagePlanSelect = omit(selections, "photos", "roomTypes", "includedOptions", "addtionalOptions");

    if (
        isEmpty(packagePlanSelect) &&
        !photosSelect &&
        !roomTypeSelect &&
        !includedOptionSelect &&
        !additionalOptionSelect
    ) {
        return defaultValue;
    }

    return {
        select: {
            ...packagePlanSelect,
            photos: photosSelect,
            roomTypes: roomTypeSelect ? { select: roomTypeSelect, orderBy: { createdAt: "desc" } } : undefined,
            includedOptions: includedOptionSelect,
            addtionalOptions: additionalOptionSelect,
        } as PackagePlanSelect,
    };
}

export const packagePlanObjectTypeDefs = gql`
    type PackagePlanObject {
        id: ID
        name: String
        description: String
        paymentTerm: HotelPaymentTerm
        stock: Int
        startUsage: Date
        endUsage: Date
        startReservation: Date
        endReservation: Date
        cutOffBeforeDays: Int
        cutOffTillTime: Time
        isBreakfastIncluded: Boolean
        hotelId: String
        photos: [Photo]
        roomTypes: [PackagePlanRoomTypeObject]
        includedOptions: [OptionObject]
        addtionalOptions: [OptionObject]
        createdAt: Date
        updatedAt: Date
    }
`;

export const packagePlanObjectResolvers = {};
