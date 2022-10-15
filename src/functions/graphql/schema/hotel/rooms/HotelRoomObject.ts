import { HotelRoom } from "@prisma/client";
import { omit } from "@utils/object-helper";
import { gql } from "apollo-server-core";
import { PrismaSelect } from "graphql-map-selections";
import { isEmpty } from "lodash";
import { Photo, PhotoSelect, toPhotoSelect } from "../../media";
import { BasicPriceSettingObject, BasicPriceSettingSelect, toBasicPriceSettingSelect } from "../basic-price-setting";

export type HotelRoomObject = Partial<HotelRoom> & {
    basicPriceSettings?: Partial<BasicPriceSettingObject>[];
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
    basicPriceSettings: PrismaSelect<BasicPriceSettingSelect>;
    createdAt: boolean;
    updatedAt: boolean;
};

export function toHotelRoomSelect(selections, defaultValue: any = false): PrismaSelect<HotelRoomSelect> {
    if (!selections || isEmpty(selections)) return defaultValue;
    const basicPriceSettingSelect = toBasicPriceSettingSelect(selections.basicPriceSettings);
    const photosSelect = toPhotoSelect(selections.photos);
    const hotelRoomSelect = omit(selections, "basicPriceSettings", "photos");
    if (isEmpty(hotelRoomSelect) && !basicPriceSettingSelect && !photosSelect) return defaultValue;

    return {
        select: {
            ...hotelRoomSelect,
            basicPriceSettings: basicPriceSettingSelect,
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
        basicPriceSettings: [BasicPriceSettingObject]
        photos: [Photo]
        createdAt: Date
        updatedAt: Date
    }
`;

export const hotelRoomObjectResolvers = {};
