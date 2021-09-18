import { gql } from "apollo-server-express";
import { Space } from "@prisma/client";
import { AddressResult } from "../address";
import { PrismaSelect, toPrismaSelect } from "graphql-map-selections";
import { omit } from "@utils/object-helper";
import { NearestStationObject, NearestStationSelect, toNearestStationSelect } from "./nearest-stations";
import { SpacePricePlanObject, SpacePricePlanSelect, toSpacePricePlanSelect } from "./space-price-plans";
import { SpaceTypeObject, SpaceTypeSelect, toSpaceTypeSelect } from "./space-types";

export type SpaceObject = Partial<Space> & {
    nearestStations?: Partial<NearestStationObject>[];
    spacePricePlan?: Partial<SpacePricePlanObject>[];
    spaceTypes?: Partial<SpaceTypeObject>[];
    address?: Partial<AddressResult>;
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
    spaceTypes: PrismaSelect<Record<"spaceType", PrismaSelect<SpaceTypeSelect>>>;
    address: any;
};

export const toSpaceSelect = (selections): PrismaSelect<SpaceSelect> => {
    const nearestStationsSelect = toNearestStationSelect(selections.nearestStations);
    const spacePricePlansSelect = toSpacePricePlanSelect(selections.spacePricePlans);
    const spaceTypesSelect = toSpaceTypeSelect(selections.spaceTypes);
    const addressSelect = toPrismaSelect(selections.address);
    const spaceSelect = omit(selections, "nearestStations", "spacePricePlan", "spaceTypes", "address");

    return {
        select: {
            ...spaceSelect,
            nearestStations: nearestStationsSelect,
            spacePricePlans: spacePricePlansSelect,
            spaceTypes: spaceTypesSelect ? { select: { spaceType: spaceTypesSelect } } : undefined,
            address: addressSelect,
        } as unknown as SpaceSelect,
    };
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
        address: Address
    }
`;
