import { IObjectTypeResolver } from "@graphql-tools/utils";
import { Hotel, Prisma } from "@prisma/client";
import { omit } from "@utils/object-helper";
import { gql } from "apollo-server-core";
import { PrismaSelect } from "graphql-map-selections";
import { isEmpty } from "lodash";
import { Context } from "../../context";
import { HostObject, HostSelect, toHostSelect } from "../account/host";
import { AddressObject, AddressSelect, toAddressSelect } from "../address";
import { Photo, PhotoSelect, toPhotoSelect } from "../media";
import { HotelNearestStationObject, HotelNearestStationSelect, toHotelNearestStationSelect } from "./nearest-stations";
import { PackagePlanObject, PackagePlanSelect, toPackagePlanSelect } from "./package-plan";
import { HotelRoomObject, HotelRoomSelect, toHotelRoomSelect } from "./rooms";

export type HotelObject = Partial<Hotel> & {
    account?: { host?: Partial<HostObject> };
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
    buildingType: boolean;
    isPetAllowed: boolean;
    address: PrismaSelect<AddressSelect>;
    nearestStations: PrismaSelect<HotelNearestStationSelect>;
    account: { select: { host: PrismaSelect<HostSelect> } };
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
    const hostSelect = toHostSelect(selections.host);
    const packagePlanSelect = toPackagePlanSelect(selections.packagePlans)?.select;
    const photosSelect = toPhotoSelect(selections.photos);
    const roomsSelect = toHotelRoomSelect(selections.rooms)?.select;
    const hotelSelect = omit(selections, "address", "host", "nearestStations", "packagePlans", "photos", "rooms");
    if (
        isEmpty(hotelSelect) &&
        !addressSelect &&
        !nearestStationsSelect &&
        !hostSelect &&
        !photosSelect &&
        !roomsSelect
    )
        return defaultValue;

    return {
        select: {
            ...hotelSelect,
            address: addressSelect,
            nearestStations: nearestStationsSelect,
            account: hostSelect ? { select: { host: hostSelect } } : false,
            packagePlans: packagePlanSelect ? { select: packagePlanSelect, orderBy: { createdAt: "desc" } } : undefined,
            photos: photosSelect,
            rooms: roomsSelect ? { select: roomsSelect, orderBy: { createdAt: "desc" } } : false,
            accountId: true,
        } as HotelSelect,
    };
}

export const hotelObjectTypeDefs = gql`
    enum BuildingType {
        WHOLE_HOUSE
        SIMPLE_ACCOMODATION
        HOTEL
        INN
    }

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
        buildingType: BuildingType
        isPetAllowed: Boolean
        address: AddressObject
        host: Host
        nearestStations: [HotelNearestStationObject]
        photos: [Photo]
        rooms: [HotelRoomObject]
        packagePlans: [PackagePlanObject]
        createdAt: Date
        updatedAt: Date
    }
`;

export const hotelObjectResolvers = {
    HotelObject: {
        host: ({ account }) => account?.host,
    } as IObjectTypeResolver<HotelObject, Context>,
};
