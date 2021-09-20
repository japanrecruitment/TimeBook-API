import { gql } from "apollo-server-core";
import { Space } from "@prisma/client";
import { AddressObject, AddressSelect, toAddressSelect } from "../address";
import { PrismaSelect } from "graphql-map-selections";
import { omit } from "@utils/object-helper";
import { NearestStationObject, NearestStationSelect, toNearestStationSelect } from "./nearest-stations";
import { SpacePricePlanObject, SpacePricePlanSelect, toSpacePricePlanSelect } from "./space-price-plans";
import { SpaceToSpaceTypeObject, SpaceToSpaceTypeSelect, toSpaceToSpaceTypeSelect } from "./space-to-space-type";
import { IObjectTypeResolver } from "@graphql-tools/utils";
import { Context } from "../../context";

export type SpaceObject = Partial<Space> & {
    nearestStations?: Partial<NearestStationObject>[];
    spacePricePlan?: Partial<SpacePricePlanObject>[];
    spaceTypes?: Partial<SpaceToSpaceTypeObject>[];
    address?: Partial<AddressObject>;
};

type SpaceSelect = {
    id: true;
    name: true;
    maximumCapacity: true;
    numberOfSeats: true;
    spaceSize: true;
    needApproval: true;
    nearestStations: PrismaSelect<NearestStationSelect>;
    spacePricePlans: PrismaSelect<SpacePricePlanSelect>;
    spaceTypes: PrismaSelect<SpaceToSpaceTypeSelect>;
    address: PrismaSelect<AddressSelect>;
};

export const toSpaceSelect = (selections): PrismaSelect<SpaceSelect> => {
    const nearestStationsSelect = toNearestStationSelect(selections.nearestStations);
    const spacePricePlansSelect = toSpacePricePlanSelect(selections.spacePricePlans);
    const spaceToSpaceTypesSelect = toSpaceToSpaceTypeSelect(selections.spaceTypes);
    const addressSelect = toAddressSelect(selections.address);
    const spaceSelect = omit(selections, "nearestStations", "spacePricePlan", "spaceTypes", "address");

    return {
        select: {
            ...spaceSelect,
            nearestStations: nearestStationsSelect,
            spacePricePlans: spacePricePlansSelect,
            spaceTypes: spaceToSpaceTypesSelect,
            address: addressSelect,
        } as unknown as SpaceSelect,
    };
};

const spaceObjectResolver: IObjectTypeResolver<SpaceObject, Context> = {
    spaceTypes: ({ spaceTypes }) => spaceTypes.map((spaceType) => spaceType.spaceType),
};

export const spaceObjectTypeDefs = gql`
    type SpaceObject {
        id: ID!
        name: String
        maximumCapacity: String
        numberOfSeats: Int
        spaceSize: Float
        needApproval: Boolean
        nearestStations: [NearestStationObject]
        spacePricePlans: [SpacePricePlanObject]
        spaceTypes: [SpaceTypeObject]
        address: AddressObject
    }
`;

export const spaceObjectResolvers = {
    SpaceObject: spaceObjectResolver,
};
