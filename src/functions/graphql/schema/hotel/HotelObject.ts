import { Hotel } from "@prisma/client";
import { omit } from "@utils/object-helper";
import { gql } from "apollo-server-core";
import { PrismaSelect } from "graphql-map-selections";
import { isEmpty } from "lodash";
import { AddressObject, AddressSelect, toAddressSelect } from "../address";
import { Photo, PhotoSelect, toPhotoSelect } from "../media";
import { HotelNearestStationObject, HotelNearestStationSelect, toHotelNearestStationSelect } from "./nearest-stations";
import { HotelRoomObject, HotelRoomSelect, toHotelRoomSelect } from "./rooms";

export type HotelObject = Partial<Hotel> & {
    address?: Partial<AddressObject>;
    nearestStations?: Partial<HotelNearestStationObject>[];
    photos?: Partial<Photo>[];
    rooms?: Partial<HotelRoomObject>[];
};

export type HotelSelect = {
    id: boolean;
    name: boolean;
    description: boolean;
    checkInTime: boolean;
    checkOutTime: boolean;
    status: boolean;
    address: PrismaSelect<AddressSelect>;
    nearestStations: PrismaSelect<HotelNearestStationSelect>;
    photos: PrismaSelect<PhotoSelect>;
    rooms: PrismaSelect<HotelRoomSelect>;
    createdAt: boolean;
    updatedAt: boolean;
};

export function toHotelSelect(selections, defaultValue: any = false): PrismaSelect<HotelSelect> {
    if (!selections || isEmpty(selections)) return defaultValue;
    const addressSelect = toAddressSelect(selections.address);
    const nearestStationsSelect = toHotelNearestStationSelect(selections.nearestStations);
    const photosSelect = toPhotoSelect(selections.photos);
    const roomsSelect = toHotelRoomSelect(selections.rooms);
    const hotelSelect = omit(selections, "address", "nearestStations", "photos", "rooms");
    if (isEmpty(hotelSelect) && !addressSelect && !nearestStationsSelect && !photosSelect && !roomsSelect)
        return defaultValue;

    return {
        select: {
            ...hotelSelect,
            address: addressSelect,
            nearestStations: nearestStationsSelect,
            photos: photosSelect,
            rooms: roomsSelect,
        } as HotelSelect,
    };
}

export const hotelObjectTypeDefs = gql`
    enum HotelStatus {
        DRAFTED
        PUBLISHED
        HIDDEN
        DELETED
    }

    type HotelObject {
        id: ID
        name: String
        description: String
        checkInTime: Time
        checkOutTime: Time
        status: HotelStatus
        address: AddressObject
        nearestStations: [HotelNearestStationObject]
        photos: [Photo]
        rooms: [HotelRoomObject]
        createdAt: Date
        updatedAt: Date
    }
`;

export const hotelObjectResolvers = {};
