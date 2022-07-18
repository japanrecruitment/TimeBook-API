import { PackagePlan } from "@prisma/client";
import { omit } from "@utils/object-helper";
import { gql } from "apollo-server-core";
import { PrismaSelect } from "graphql-map-selections";
import { isEmpty } from "lodash";
import { Photo, PhotoSelect, toPhotoSelect } from "../../media";
import {
    PackagePlanRoomTypeObject,
    PackagePlanRoomTypeSelect,
    toPackagePlanRoomTypeSelect,
} from "./PackagePlanRoomTypeObject";

export type PackagePlanObject = Partial<PackagePlan> & {
    photos?: Partial<Photo>[];
    roomTypes?: Partial<PackagePlanRoomTypeObject>[];
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
    hotelId: boolean;
    photos: PrismaSelect<PhotoSelect>;
    roomTypes: PrismaSelect<PackagePlanRoomTypeSelect>;
    createdAt: boolean;
    updatedAt: boolean;
};

export function toPackagePlanSelect(selections, defaultValue: any = false): PrismaSelect<PackagePlanSelect> {
    if (!selections || isEmpty(selections)) return defaultValue;
    const photosSelect = toPhotoSelect(selections.photos);
    const roomTypeSelect = toPackagePlanRoomTypeSelect(selections.roomTypes);
    const hotelRoomSelect = omit(selections, "photos", "roomTypes");
    if (isEmpty(hotelRoomSelect) && !photosSelect && !roomTypeSelect) return defaultValue;

    return {
        select: {
            ...hotelRoomSelect,
            photos: photosSelect,
            roomTypes: roomTypeSelect,
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
        hotelId: String
        photos: [Photo]
        roomTypes: [PackagePlanRoomTypeObject]
        createdAt: Date
        updatedAt: Date
    }
`;

export const packagePlanObjectResolvers = {};
