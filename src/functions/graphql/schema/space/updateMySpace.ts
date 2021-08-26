import { gql } from "apollo-server-core";
import { Context } from "../../context";
import { IFieldResolver } from "@graphql-tools/utils";
import { GqlError } from "../../error";
import { Result } from "../core/result";
import { UpdateSpacePricePlanInput } from "./spacePricePlan";
import { NearestStationsInput } from "./nearestStation";
import { AddressInput } from "../address";
import { omit } from "@utils/object-helper";

type UpdateMySpaceInput = {
    id: string;
    name?: string;
    maximumCapacity?: number;
    numberOfSeats?: number;
    spaceSize?: number;
    nearestStations?: NearestStationsInput[];
    spacePricePlans?: UpdateSpacePricePlanInput;
    spaceTypes?: string[];
    address?: AddressInput;
};

type UpdateMySpace = IFieldResolver<any, Context, Record<"input", UpdateMySpaceInput>, Promise<Result>>;

const updateMySpace: UpdateMySpace = async (_, { input }, { authData, store, dataSources }) => {
    const { accountId } = authData;
    const { id, nearestStations, spacePricePlans, spaceTypes, address, ...spaceData } = input;

    const space = await store.space.findUnique({
        where: { id },
        select: {
            accountId: true,
            nearestStations: { select: { stationId: true } },
            spaceTypes: { select: { spaceTypeId: true } },
        },
    });

    if (!space) throw new GqlError({ code: "NOT_FOUND", message: "Space not found" });

    if (accountId !== space.accountId)
        throw new GqlError({ code: "FORBIDDEN", message: "You are not allowed to modify this space" });

    const prevNearestStationIds = space.nearestStations?.map(({ stationId }) => stationId);
    const newNearestStationIds = nearestStations?.map(({ stationId }) => stationId);
    const nearestStationToAdd = nearestStations?.filter(
        (station) => !prevNearestStationIds?.includes(station.stationId)
    );
    const nearestStationTpDelete =
        nearestStations && prevNearestStationIds?.filter((stationId) => !newNearestStationIds?.includes(stationId));

    const prevSpaceTypeIds = space.spaceTypes?.map(({ spaceTypeId }) => spaceTypeId);
    const spaceTypesToAdd = spaceTypes
        ?.filter((spaceTypeId) => !prevSpaceTypeIds?.includes(spaceTypeId))
        .map((spaceTypeId) => ({ spaceTypeId }));
    const spaceTypesToDelete =
        spaceTypes && prevSpaceTypeIds?.filter((spaceTypeId) => !spaceTypes?.includes(spaceTypeId));

    const newSpace = await store.space.update({
        where: { id },
        data: {
            ...spaceData,
            spacePricePlans: spacePricePlans && { update: spacePricePlans },
            spaceTypes: {
                deleteMany:
                    spaceTypesToDelete?.length > 0
                        ? { spaceTypeId: { in: spaceTypesToDelete }, spaceId: id }
                        : undefined,
                createMany: spaceTypesToAdd?.length > 0 ? { data: spaceTypesToAdd } : undefined,
            },
            nearestStations: {
                deleteMany:
                    nearestStationTpDelete?.length > 0
                        ? { stationId: { in: nearestStationTpDelete }, spaceId: id }
                        : undefined,
                createMany: nearestStationToAdd?.length > 0 ? { data: nearestStationToAdd } : undefined,
            },
            address: address && {
                update: {
                    ...omit(address, "userId", "companyId", "prefectureId"),
                    prefecture: address.prefectureId && { connect: { id: address.prefectureId } },
                },
            },
        },
        include: {
            address: { include: { prefecture: true } },
            nearestStations: true,
            spaceTypes: { include: { spaceType: true } },
        },
    });

    await dataSources.spaceAlgoliaDS.update({
        ...spaceData,
        objectID: id,
        nearestStations: newSpace?.nearestStations?.map(({ stationId }) => stationId),
        prefecture: newSpace?.address?.prefecture?.name,
        price: spacePricePlans.price,
        priceType: spacePricePlans.type,
        rating: 0,
        spaceTypes: newSpace?.spaceTypes?.map(({ spaceType }) => spaceType.title),
        thumbnail: "",
        updatedAt: newSpace?.updatedAt.getTime(),
        viewCount: 0,
    });

    return { message: `Successfully updated space` };
};

export const updateMySpaceTypeDefs = gql`
    input UpdateMySpaceInput {
        id: ID!
        name: String
        maximumCapacity: Int
        numberOfSeats: Int
        spaceSize: Float
        nearestStations: [NearestStationsInput]
        spacePricePlans: UpdateSpacePricePlanInput
        spaceTypes: [ID]
        address: AddressInput
    }

    type Mutation {
        updateMySpace(input: UpdateMySpaceInput!): Result! @auth(requires: [user, host])
    }
`;

export const updateMySpaceResolvers = {
    Mutation: { updateMySpace },
};
