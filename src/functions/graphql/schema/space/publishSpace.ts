import { IFieldResolver } from "@graphql-tools/utils";
import { gql } from "apollo-server-core";
import { Context } from "../../context";
import { GqlError } from "../../error";
import { Result } from "../core/result";

type PublishSpaceArgs = { id: string };

type PublishSpaceResult = Promise<Result> | Result;

type PublishSpace = IFieldResolver<any, Context, PublishSpaceArgs, PublishSpaceResult>;

const publishSpace: PublishSpace = async (_, { id }, { authData, store, dataSources }) => {
    const { accountId } = authData || {};

    const space = await store.space.findFirst({
        where: { id, isDeleted: false },
        include: {
            address: { include: { prefecture: true } },
            availableAmenities: true,
            nearestStations: true,
            pricePlans: true,
            spaceTypes: true,
        },
    });

    if (!space) throw new GqlError({ code: "NOT_FOUND", message: "Space not found" });

    if (accountId !== space.accountId)
        throw new GqlError({ code: "FORBIDDEN", message: "You are not allowed to modify this space" });

    if (space.published) throw new GqlError({ code: "FORBIDDEN", message: "Space already published" });

    await dataSources.spaceAlgolia.saveObject({
        objectID: id,
        name: space.name,
        availableAmenities: space.availableAmenities?.map(({ name }) => name),
        city: space.address?.city,
        maximumCapacity: space.maximumCapacity,
        nearestStations: space.nearestStations?.map(({ stationId }) => stationId),
        numberOfSeats: space.numberOfSeats,
        prefecture: space.address?.prefecture?.name,
        price: space.pricePlans?.map(({ amount, duration, type }) => ({ amount, duration, type })),
        spaceSize: space.spaceSize,
        spaceTypes: space.spaceTypes?.map(({ title }) => title),
    });

    return { message: `Successfully published space` };
};

export const publishSpaceTypeDefs = gql`
    type Mutation {
        publishSpace(id: ID!): Result! @auth(requires: [user, host])
    }
`;

export const publishSpaceResolvers = {
    Mutation: { publishSpace },
};
