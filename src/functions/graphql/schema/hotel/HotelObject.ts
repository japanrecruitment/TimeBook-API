import { Hotel, Prisma } from "@prisma/client";
import { omit } from "@utils/object-helper";
import { gql } from "apollo-server-core";
import { PrismaSelect } from "graphql-map-selections";
import { isEmpty } from "lodash";
import { AddressObject, AddressSelect, toAddressSelect } from "../address";
import { Photo, PhotoSelect, toPhotoSelect } from "../media";
import { HotelNearestStationObject, HotelNearestStationSelect, toHotelNearestStationSelect } from "./nearest-stations";
import { PackagePlanObject, PackagePlanSelect, toPackagePlanSelect } from "./package-plan";
import { HotelRoomObject, HotelRoomSelect, toHotelRoomSelect } from "./rooms";

export type HotelObject = Partial<Hotel> & {
    address?: Partial<AddressObject>;
    nearestStations?: Partial<HotelNearestStationObject>[];
    packagePlans?: Partial<PackagePlanObject>[];
    photos?: Partial<Photo>[];
    rooms?: Partial<HotelRoomObject>[];
};

// {
//     select: {},
//     orderBy: { createdAt: "desc" },
// }
export type HotelSelect = {
    id: boolean;
    name: boolean;
    description: boolean;
    checkInTime: boolean;
    checkOutTime: boolean;
    status: boolean;
    address: PrismaSelect<AddressSelect>;
    nearestStations: PrismaSelect<HotelNearestStationSelect>;
    packagePlans: PrismaSelect<PackagePlanSelect> & { orderBy: { createdAt: Prisma.SortOrder } };
    photos: PrismaSelect<PhotoSelect>;
    rooms: PrismaSelect<HotelRoomSelect> & { orderBy: { createdAt: Prisma.SortOrder } };
    accountId: boolean;
    createdAt: boolean;
    updatedAt: boolean;
};

export function toHotelSelect(selections, defaultValue: any = false): PrismaSelect<HotelSelect> {
    if (!selections || isEmpty(selections)) return defaultValue;
    const addressSelect = toAddressSelect(selections.address);
    const nearestStationsSelect = toHotelNearestStationSelect(selections.nearestStations);
    const packagePlanSelect = toPackagePlanSelect(selections.packagePlans)?.select;
    const photosSelect = toPhotoSelect(selections.photos);
    const roomsSelect = toHotelRoomSelect(selections.rooms)?.select;
    const hotelSelect = omit(selections, "address", "nearestStations", "packagePlans", "photos", "rooms");
    if (isEmpty(hotelSelect) && !addressSelect && !nearestStationsSelect && !photosSelect && !roomsSelect)
        return defaultValue;

    return {
        select: {
            ...hotelSelect,
            address: addressSelect,
            nearestStations: nearestStationsSelect,
            packagePlans: packagePlanSelect ? { select: packagePlanSelect, orderBy: { createdAt: "desc" } } : undefined,
            photos: photosSelect,
            rooms: roomsSelect ? { select: roomsSelect, orderBy: { createdAt: "desc" } } : false,
            accountId: true,
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
        packagePlans: [PackagePlanObject]
        createdAt: Date
        updatedAt: Date
    }
`;

export const hotelObjectResolvers = {};
