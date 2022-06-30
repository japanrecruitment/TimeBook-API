import { Hotel, HotelRoom } from "@prisma/client";
import { omit } from "@utils/object-helper";
import { gql } from "apollo-server-core";
import { PrismaSelect } from "graphql-map-selections";
import { isEmpty } from "lodash";
import { Photo, PhotoSelect, toPhotoSelect } from "../../media";

export type HotelRoomObject = Partial<HotelRoom> & {
    photos?: Partial<Photo>[];
};

export type HotelRoomSelect = {
    id: boolean;
    name: boolean;
    description: boolean;
    paymentTerm: boolean;
    maxCapacityAdult: boolean;
    maxCapacityChild: boolean;
    stock: boolean;
    hotelId: boolean;
    photos: PrismaSelect<PhotoSelect>;
    createdAt: boolean;
    updatedAt: boolean;
};

export function toHotelRoomSelect(selections, defaultValue: any = false): PrismaSelect<HotelRoomSelect> {
    if (!selections || isEmpty(selections)) return defaultValue;
    const photosSelect = toPhotoSelect(selections.photos);
    const hotelRoomSelect = omit(selections, "photos");
    if (isEmpty(hotelRoomSelect) && !photosSelect) return defaultValue;

    return {
        select: {
            ...hotelRoomSelect,
            photos: photosSelect,
        } as HotelRoomSelect,
    };
}

export const hotelRoomObjectTypeDefs = gql`
    enum HotelPaymentTerm {
        PER_PERSON
        PER_ROOM
    }

    type HotelRoomObject {
        id: ID
        name: String
        description: String
        paymentTerm: HotelPaymentTerm
        maxCapacityAdult: Int
        maxCapacityChild: Int
        stock: Int
        hotelId: ID
        photos: [Photo]
        createdAt: Date
        updatedAt: Date
    }
`;

export const hotelRoomObjectResolvers = {};
