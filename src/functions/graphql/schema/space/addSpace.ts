import { IFieldResolver } from "@graphql-tools/utils";
import { gql } from "apollo-server-core";
import { Context } from "../../context";
import { GqlError } from "../../error";
import { AddressInput } from "../address";
import { Result } from "../core/result";
import { NearestStationsInput } from "./nearestStation";
import { AddSpacePricePlanInput } from "./spacePricePlan";

type AddSpaceInput = {
    name: string;
    maximumCapacity: number;
    numberOfSeats: number;
    spaceSize: number;
    spacePricePlan: AddSpacePricePlanInput;
    nearestStations: NearestStationsInput[];
    spaceTypes: string[];
    address: AddressInput;
};

type AddSpace = IFieldResolver<any, Context, Record<"input", AddSpaceInput>, Promise<Result>>;

const addSpace: AddSpace = async (_, { input }, { authData, store, dataSources }) => {
    const { accountId } = authData;
    const { name, maximumCapacity, numberOfSeats, spaceSize, spacePricePlan, nearestStations, spaceTypes, address } =
        input;
    const { title: planTitle, type, price, maintenanceFee, lastMinuteDiscount, cooldownTime } = spacePricePlan;
    const { addressLine1, addressLine2, city, prefectureId, latitude, longitude, postalCode } = address;

    const isValid =
        name.trim() &&
        planTitle.trim() &&
        maximumCapacity != 0 &&
        numberOfSeats != 0 &&
        spaceSize != 0 &&
        price != 0 &&
        maintenanceFee != 0 &&
        cooldownTime != 0 &&
        addressLine1.trim() &&
        city.trim() &&
        postalCode.trim() &&
        postalCode.trim();

    if (!isValid) throw new GqlError({ code: "BAD_USER_INPUT", message: "Provide all neccessary fields" });
    const space = await store.space.create({
        data: {
            name,
            maximumCapacity,
            numberOfSeats,
            spaceSize,
            account: { connect: { id: accountId } },
            spacePricePlans: {
                create: { title: planTitle, type, price, maintenanceFee, lastMinuteDiscount, cooldownTime },
            },
            nearestStations: { createMany: { data: nearestStations } },
            spaceTypes: { createMany: { data: spaceTypes.map((spaceTypeId) => ({ spaceTypeId })) } },
            address: {
                create: {
                    addressLine1,
                    addressLine2,
                    city,
                    postalCode,
                    latitude,
                    longitude,
                    prefecture: prefectureId && { connect: { id: prefectureId } },
                },
            },
        },
        include: { address: { include: { prefecture: true } }, spaceTypes: { include: { spaceType: true } } },
    });

    // await dataSources.spaceAlgoliaDS.add({
    //     objectID: space.id,
    //     dailyPrice,
    //     hourlyPrice,
    //     name,
    //     maximumCapacity,
    //     nearestStations: nearestStations.map(({ stationId }) => stationId),
    //     prefecture: space?.address?.prefecture?.name,
    //     rating: 0,
    //     spaceSize,
    //     spaceTypes: space?.spaceTypes?.map(({ spaceType }) => spaceType.title),
    //     thumbnail: "",
    //     updatedAt: space?.updatedAt.getTime(),
    //     viewCount: 0,
    // });

    return { message: `Successfully added space` };
};

export const addSpaceTypeDefs = gql`
    input AddSpaceInput {
        name: String!
        maximumCapacity: Int!
        numberOfSeats: Int!
        spaceSize: Float
        spacePricePlan: AddSpacePricePlanInput!
        nearestStations: [NearestStationsInput]!
        spaceTypes: [ID]!
        address: AddressInput!
    }

    type Mutation {
        addSpace(input: AddSpaceInput!): Result! @auth(requires: [user, host])
    }
`;

export const addSpaceResolvers = { Mutation: { addSpace } };
