import { IFieldResolver } from "@graphql-tools/utils";
import { gql } from "apollo-server-core";
import { Context } from "../../../context";
import { SpaceAmenitiesObject } from "./SpaceAmenitiesObject";

type AllSpaceAmenitiesResult = Promise<Array<SpaceAmenitiesObject>>;

type AllSpaceAmenities = IFieldResolver<any, Context, any, AllSpaceAmenitiesResult>;

const allSpaceAmenities: AllSpaceAmenities = async (_, __, { dataSources, store }) => {
    const cacheKey = "space-amenities:all";
    const cacheDoc = await dataSources.redis.fetch(cacheKey);
    if (cacheDoc) return cacheDoc;

    const amenities = await store.spaceAmenities.findMany();

    dataSources.redis.store(cacheKey, amenities, 60 * 60 * 24 * 30 * 6);

    return amenities;
};

export const allSpaceAmenitiesTypeDefs = gql`
    type Query {
        allSpaceAmenities: [SpaceAmenitiesObject]!
    }
`;

export const allSpaceAmenitiesResolvers = {
    Query: { allSpaceAmenities },
};
