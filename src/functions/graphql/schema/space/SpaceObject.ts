import { gql } from "apollo-server-core";
import { Space } from "@prisma/client";
import { AddressObject, AddressSelect, toAddressSelect } from "../address";
import { PrismaSelect } from "graphql-map-selections";
import { isEmpty } from "lodash";
import { omit } from "@utils/object-helper";
import { NearestStationObject, NearestStationSelect, toNearestStationSelect } from "./nearest-stations";
import { SpacePricePlanObject, SpacePricePlanSelect, toSpacePricePlanSelect } from "./space-price-plans";
import { SpaceToSpaceTypeObject, SpaceToSpaceTypeSelect, toSpaceToSpaceTypeSelect } from "./space-to-space-type";
import { IObjectTypeResolver } from "@graphql-tools/utils";
import { Context } from "../../context";
import { Photo, PhotoSelect, toPhotoSelect } from "../media";
import { toHostSelect, HostSelect, HostObject } from "../account/host/HostObject";

export type SpaceObject = Partial<Space> & {
    nearestStations?: Partial<NearestStationObject>[];
    spacePricePlan?: Partial<SpacePricePlanObject>[];
    spaceTypes?: Partial<SpaceToSpaceTypeObject>[];
    address?: Partial<AddressObject>;
    photos?: Partial<Photo>[];
    account?: { host?: Partial<HostObject> };
};

export type SpaceSelect = {
    id: boolean;
    description: boolean;
    name: boolean;
    maximumCapacity: boolean;
    numberOfSeats: boolean;
    spaceSize: boolean;
    needApproval: boolean;
    nearestStations: PrismaSelect<NearestStationSelect>;
    spacePricePlans: PrismaSelect<SpacePricePlanSelect>;
    spaceTypes: PrismaSelect<SpaceToSpaceTypeSelect>;
    address: PrismaSelect<AddressSelect>;
    photos: PrismaSelect<PhotoSelect>;
    account: { select: { host: PrismaSelect<HostSelect> } };
};

export const toSpaceSelect = (selections, defaultValue: any = false): PrismaSelect<SpaceSelect> => {
    if (!selections || isEmpty(selections)) return defaultValue;
    const nearestStationsSelect = toNearestStationSelect(selections.nearestStations);
    const spacePricePlansSelect = toSpacePricePlanSelect(selections.spacePricePlans);
    const spaceToSpaceTypesSelect = toSpaceToSpaceTypeSelect(selections.spaceTypes);
    const addressSelect = toAddressSelect(selections.address);
    const photosSelect = toPhotoSelect(selections.photos);
    const hostSelect = toHostSelect(selections.host);
    const spaceSelect = omit(selections, "nearestStations", "spacePricePlan", "spaceTypes", "address", "photo", "host");

    if (
        isEmpty(spaceSelect) &&
        !nearestStationsSelect &&
        !spacePricePlansSelect &&
        !spaceToSpaceTypesSelect &&
        !addressSelect &&
        !photosSelect &&
        !hostSelect
    )
        return defaultValue;

    return {
        select: {
            ...spaceSelect,
            nearestStations: nearestStationsSelect,
            spacePricePlans: spacePricePlansSelect,
            spaceTypes: spaceToSpaceTypesSelect,
            address: addressSelect,
            photos: photosSelect,
            account: hostSelect ? { select: { host: hostSelect } } : false,
        } as SpaceSelect,
    };
};

const spaceObjectResolver: IObjectTypeResolver<SpaceObject, Context> = {
    spaceTypes: ({ spaceTypes }) => spaceTypes.map((spaceType) => spaceType.spaceType),
    host: ({ account }) => account?.host,
};

export const spaceObjectTypeDefs = gql`
    type SpaceObject {
        id: ID!
        description: String
        name: String
        maximumCapacity: Int
        numberOfSeats: Int
        spaceSize: Float
        needApproval: Boolean
        nearestStations: [NearestStationObject]
        spacePricePlans: [SpacePricePlanObject]
        spaceTypes: [SpaceTypeObject]
        address: AddressObject
        photos: [Photo]
        host: Host
    }
`;

export const spaceObjectResolvers = {
    SpaceObject: spaceObjectResolver,
};
