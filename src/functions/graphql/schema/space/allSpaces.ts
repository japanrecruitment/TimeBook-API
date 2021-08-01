import { IFieldResolver } from "@graphql-tools/utils";
import { Space, SpacePricePlan, SpaceType } from "@prisma/client";
import { Log } from "@utils/logger";
import { omit } from "@utils/object-helper";
import { gql } from "apollo-server-core";
import { mapSelections, toPrismaSelect } from "graphql-map-selections";
import { Context } from "../../context";
import { PaginationOption } from "../core/paginationOption";
import { NearestStation } from "./nearestStation";

export type SpaceResult = Partial<Space> & {
    nearestStations?: Partial<NearestStation>[];
    spacePricePlan?: Partial<SpacePricePlan>;
    spaceTypes?: Partial<SpaceType>[];
};

type AllSpaceArgs = {
    paginate: PaginationOption;
};

type AllSpaces = IFieldResolver<any, Context, AllSpaceArgs, Promise<SpaceResult[]>>;

const allSpaces: AllSpaces = async (_, { paginate }, { store }, info) => {
    const gqlSelect = mapSelections(info);
    const nearestStationsSelect = toPrismaSelect(gqlSelect.nearestStations);
    const spacePricePlanSelect = toPrismaSelect(gqlSelect.spacePricePlan);
    const spaceTypesSelect = toPrismaSelect(gqlSelect.spaceTypes);
    const spaceSelect = omit(gqlSelect, "nearestStations", "spacePricePlan", "spaceTypes");

    const { take, skip } = paginate || {};

    const allSpaces = await store.space.findMany({
        select: {
            ...spaceSelect,
            nearestStations: nearestStationsSelect,
            spacePricePlans: spacePricePlanSelect,
            spaceTypes: spaceTypesSelect ? { select: { spaceType: spaceTypesSelect } } : undefined,
        },
        take,
        skip,
    });

    const result = allSpaces.map((space) => {
        const spaceTypes = space.spaceTypes.map((spaceType) => spaceType.spaceType);
        return { ...space, spaceTypes };
    });

    Log(result);

    return result || [];
};

export const allSpacesTypeDefs = gql`
    type Space {
        id: ID!
        name: String
        maximumCapacity: String
        numberOfSeats: Int
        spaceSize: Float
        needApproval: Boolean
        nearestStations: [NearestStation]
        spacePricePlan: [SpacePricePlan]
        spaceTypes: [SpaceType]
    }

    type Query {
        allSpaces(paginate: PaginationOption): [Space]
    }
`;

export const allSpacesResolvers = {
    Query: { allSpaces },
};
