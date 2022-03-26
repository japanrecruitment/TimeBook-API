import { gql } from "apollo-server-core";
import { Space } from "@prisma/client";
import { AddressObject, AddressSelect, toAddressSelect } from "../address";
import { PrismaSelect } from "graphql-map-selections";
import { isEmpty } from "lodash";
import { omit } from "@utils/object-helper";
import { NearestStationObject, NearestStationSelect, toNearestStationSelect } from "./nearest-stations";
import { SpacePricePlanObject, SpacePricePlanSelect, toSpacePricePlanSelect } from "./space-price-plans";
import { IObjectTypeResolver } from "@graphql-tools/utils";
import { Context } from "../../context";
import { Photo, PhotoSelect, toPhotoSelect } from "../media";
import { toHostSelect, HostSelect, HostObject } from "../account/host/HostObject";
import { ReservationObject } from "../reservation/ReservationObject";
import { SpaceTypeObject, SpaceTypeSelect, toSpaceTypeSelect } from "./space-types";
import { SpaceAmenitiesObject, SpaceAmenitiesSelect, toSpaceAmenitiesSelect } from "./space-amenities";
import { SpaceSettingObject, SpaceSettingSelect, toSpaceSettingSelect } from "./space-setting";
import { RatingObject, RatingSelect, toRatingSelect } from "./ratings/RatingObject";

export type SpaceObject = Partial<Space> & {
    nearestStations?: Partial<NearestStationObject>[];
    availableAmenities?: Partial<SpaceAmenitiesObject>[];
    spaceTypes?: Partial<SpaceTypeObject>[];
    address?: Partial<AddressObject>;
    photos?: Partial<Photo>[];
    account?: { host?: Partial<HostObject> };
    reservations?: Partial<ReservationObject>[];
    pricePlans?: Partial<SpacePricePlanObject>[];
    settings?: Partial<SpaceSettingObject>[];
    ratings?: Partial<RatingObject>[];
};

export type SpaceSelect = {
    id: boolean;
    description: boolean;
    name: boolean;
    maximumCapacity: boolean;
    numberOfSeats: boolean;
    spaceSize: boolean;
    needApproval: boolean;
    published: boolean;
    isDeleted: boolean;
    nearestStations: PrismaSelect<NearestStationSelect>;
    availableAmenities: PrismaSelect<SpaceAmenitiesSelect>;
    pricePlans: PrismaSelect<SpacePricePlanSelect> & { where: { isDeleted: false } };
    settings: PrismaSelect<SpaceSettingSelect>;
    spaceTypes: PrismaSelect<SpaceTypeSelect>;
    address: PrismaSelect<AddressSelect>;
    photos: PrismaSelect<PhotoSelect>;
    account: { select: { host: PrismaSelect<HostSelect> } };
    reservations: { where: any; select: { fromDateTime: boolean; toDateTime: boolean } };
    ratings: PrismaSelect<RatingSelect>;
};

export const toSpaceSelect = (selections, defaultValue: any = false): PrismaSelect<SpaceSelect> => {
    if (!selections || isEmpty(selections)) return defaultValue;
    const nearestStationsSelect = toNearestStationSelect(selections.nearestStations);
    const availableAmenitiesSelect = toSpaceAmenitiesSelect(selections.availableAmenities);
    const pricePlansSelect = toSpacePricePlanSelect(selections.pricePlans);
    const settingsSelect = toSpaceSettingSelect(selections.settings);
    const spaceTypesSelect = toSpaceTypeSelect(selections.spaceTypes);
    const addressSelect = toAddressSelect(selections.address);
    const photosSelect = toPhotoSelect(selections.photos);
    const hostSelect = toHostSelect(selections.host);
    const reservationsSelect = selections.reservedDates
        ? { where: { fromDateTime: { gte: new Date() } }, select: { fromDateTime: true, toDateTime: true } }
        : false;
    const ratingSelect = toRatingSelect(selections.ratings);
    const spaceSelect = omit(
        selections,
        "nearestStations",
        "availableAmenities",
        "pricePlans",
        "settings",
        "spaceTypes",
        "address",
        "photo",
        "host",
        "reservedDates",
        "ratings"
    );

    console.log(spaceSelect);

    if (
        isEmpty(spaceSelect) &&
        !nearestStationsSelect &&
        !availableAmenitiesSelect &&
        !pricePlansSelect &&
        !settingsSelect &&
        !spaceTypesSelect &&
        !addressSelect &&
        !photosSelect &&
        !hostSelect &&
        !reservationsSelect
    )
        return defaultValue;

    return {
        select: {
            ...spaceSelect,
            isDeleted: true,
            nearestStations: nearestStationsSelect,
            availableAmenities: availableAmenitiesSelect,
            pricePlans: {
                where: { isDeleted: false },
                select: pricePlansSelect.select,
            },
            settings: settingsSelect,
            spaceTypes: spaceTypesSelect,
            address: addressSelect,
            photos: photosSelect,
            account: hostSelect ? { select: { host: hostSelect } } : false,
            reservations: reservationsSelect,
            ratings: ratingSelect,
        } as SpaceSelect,
    };
};

const spaceObjectResolver: IObjectTypeResolver<SpaceObject, Context> = {
    host: ({ account }) => account?.host,
    reservedDates: ({ reservations }) => reservations,
};

export const spaceObjectTypeDefs = gql`
    type ReservedDates {
        fromDateTime: Date
        toDateTime: Date
    }

    type SpaceObject {
        id: ID!
        description: String
        name: String
        maximumCapacity: Int
        numberOfSeats: Int
        spaceSize: Float
        needApproval: Boolean
        published: Boolean
        nearestStations: [NearestStationObject]
        spaceTypes: [SpaceTypeObject]
        address: AddressObject
        photos: [Photo]
        host: Host
        availableAmenities: [SpaceAmenitiesObject]
        pricePlans: [SpacePricePlanObject]
        settings: [SpaceSettingObject]
        reservedDates: [ReservedDates]
        ratings: [RatingObject]
    }
`;

export const spaceObjectResolvers = {
    SpaceObject: spaceObjectResolver,
};
