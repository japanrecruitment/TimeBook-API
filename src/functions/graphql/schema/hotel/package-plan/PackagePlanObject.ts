import { PackagePlan } from "@prisma/client";
import { omit } from "@utils/object-helper";
import { gql } from "apollo-server-core";
import { PrismaSelect } from "graphql-map-selections";
import { isEmpty } from "lodash";
import { Photo, PhotoSelect, toPhotoSelect } from "../../media";
import { HotelRoomPlanObject, HotelRoomPlanSelect, toHotelRoomPlanSelect } from "../hotel-room-plan";

export type PackagePlanObject = Partial<PackagePlan> & {
    photos?: Partial<Photo>[];
    hotelRoomPlans?: Partial<HotelRoomPlanObject>[];
};

export type PackagePlanSelect = {
    id: boolean;
    name: boolean;
    description: boolean;
    paymentTerm: boolean;
    startUsage: boolean;
    endUsage: boolean;
    startReservation: boolean;
    endReservation: boolean;
    cutOffBeforeDays: boolean;
    cutOffTillTime: boolean;
    hotelId: boolean;
    photos: PrismaSelect<PhotoSelect>;
    hotelRoomPlans: PrismaSelect<Omit<HotelRoomPlanSelect, "packagePlan">>;
    createdAt: boolean;
    updatedAt: boolean;
};

export function toPackagePlanSelect(selections, defaultValue: any = false): PrismaSelect<PackagePlanSelect> {
    if (!selections || isEmpty(selections)) return defaultValue;
    const photosSelect = toPhotoSelect(selections.photos);
    const hotelRoomPlanSelect = toHotelRoomPlanSelect(selections.hotelRoomPlans);
    const hotelRoomSelect = omit(selections, "photos", "hotelRoomPlans");
    if (isEmpty(hotelRoomSelect) && !photosSelect && !hotelRoomPlanSelect) return defaultValue;

    return {
        select: {
            ...hotelRoomSelect,
            photos: photosSelect,
            hotelRoomPlans: { select: omit(hotelRoomPlanSelect.select, "packagePlan") },
        } as PackagePlanSelect,
    };
}

export const packagePlanObjectTypeDefs = gql`
    type PackagePlanObject {
        id: ID
        name: String
        description: String
        paymentTerm: HotelPaymentTerm
        startUsage: Date
        endUsage: Date
        startReservation: Date
        endReservation: Date
        cutOffBeforeDays: Int
        cutOffTillTime: Time
        hotelId: String
        photos: [Photo]
        hotelRoomPlans: [HotelRoomPlanObject]
        createdAt: Date
        updatedAt: Date
    }
`;

export const packagePlanObjectResolvers = {};
