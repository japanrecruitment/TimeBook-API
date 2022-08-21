import { PackagePlan, Prisma } from "@prisma/client";
import { omit } from "@utils/object-helper";
import { gql } from "apollo-server-core";
import { PrismaSelect } from "graphql-map-selections";
import { isEmpty } from "lodash";
import { CancelPolicyObject, CancelPolicySelect, toCancelPolicySelect } from "../../cancel-policy/CancelPolicyObject";
import { Photo, PhotoSelect, toPhotoSelect } from "../../media";
import { OptionObject, OptionSelect, toOptionSelect } from "../../options";
import {
    PackagePlanRoomTypeObject,
    PackagePlanRoomTypeSelect,
    toPackagePlanRoomTypeSelect,
} from "./PackagePlanRoomTypeObject";

export type PackagePlanObject = Partial<PackagePlan> & {
    cancelPolicy?: Partial<CancelPolicyObject>;
    photos?: Partial<Photo>[];
    roomTypes?: Partial<PackagePlanRoomTypeObject>[];
    includedOptions?: Partial<OptionObject>[];
    additionalOptions?: Partial<OptionObject>[];
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
    subcriptionPrice: boolean;
    hotelId: boolean;
    cancelPolicy: PrismaSelect<CancelPolicySelect>;
    photos: PrismaSelect<PhotoSelect>;
    roomTypes: PrismaSelect<PackagePlanRoomTypeSelect> & { orderBy: { createdAt: Prisma.SortOrder } };
    includedOptions: PrismaSelect<OptionSelect>;
    additionalOptions: PrismaSelect<OptionSelect>;
    createdAt: boolean;
    updatedAt: boolean;
};

export function toPackagePlanSelect(selections, defaultValue: any = false): PrismaSelect<PackagePlanSelect> {
    if (!selections || isEmpty(selections)) return defaultValue;
    const cancelPolicySelect = toCancelPolicySelect(selections.cancelPolicy);
    const photosSelect = toPhotoSelect(selections.photos);
    const roomTypeSelect = toPackagePlanRoomTypeSelect(selections.roomTypes)?.select;
    const includedOptionSelect = toOptionSelect(selections.includedOptions);
    const additionalOptionSelect = toOptionSelect(selections.additionalOptions);
    const packagePlanSelect = omit(
        selections,
        "cancelPolicy",
        "photos",
        "roomTypes",
        "includedOptions",
        "additionalOptions"
    );

    if (
        isEmpty(packagePlanSelect) &&
        !cancelPolicySelect &&
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
            cancelPolicy: cancelPolicySelect,
            photos: photosSelect,
            roomTypes: roomTypeSelect ? { select: roomTypeSelect, orderBy: { createdAt: "desc" } } : undefined,
            includedOptions: includedOptionSelect,
            additionalOptions: additionalOptionSelect,
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
        subcriptionPrice: Int
        hotelId: String
        cancelPolicy: CancelPolicyObject
        photos: [Photo]
        roomTypes: [PackagePlanRoomTypeObject]
        includedOptions: [OptionObject]
        additionalOptions: [OptionObject]
        createdAt: Date
        updatedAt: Date
    }
`;

export const packagePlanObjectResolvers = {};
