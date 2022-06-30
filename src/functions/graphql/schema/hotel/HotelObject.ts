import { Hotel } from "@prisma/client";
import { Log } from "@utils/logger";
import { omit } from "@utils/object-helper";
import { gql } from "apollo-server-core";
import { PrismaSelect } from "graphql-map-selections";
import { isEmpty } from "lodash";
import { AddressObject, AddressSelect, toAddressSelect } from "../address";
import { Photo, PhotoSelect, toPhotoSelect } from "../media";
import { HotelNearestStationObject, HotelNearestStationSelect, toHotelNearestStationSelect } from "./nearest-stations";

export type HotelObject = Partial<Hotel> & {
    address?: Partial<AddressObject>;
    nearestStations?: Partial<HotelNearestStationObject>[];
    photos?: Partial<Photo>[];
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
    createdAt: boolean;
    updatedAt: boolean;
};

export function toHotelSelect(selections, defaultValue: any = false): PrismaSelect<HotelSelect> {
    if (!selections || isEmpty(selections)) return defaultValue;
    const addressSelect = toAddressSelect(selections.address);
    const nearestStationsSelect = toHotelNearestStationSelect(selections.nearestStations);
    const photosSelect = toPhotoSelect(selections.photos);
    const hotelSelect = omit(selections, "address", "nearestStations", "photos");
    if (isEmpty(hotelSelect) && !addressSelect && !nearestStationsSelect && !photosSelect) return defaultValue;

    return {
        select: {
            ...hotelSelect,
            address: addressSelect,
            nearestStations: nearestStationsSelect,
            photos: photosSelect,
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
        createdAt: Date
        updatedAt: Date
    }
`;

export const hotelObjectResolvers = {};
