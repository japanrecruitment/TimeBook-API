import { IFieldResolver } from "@graphql-tools/utils";
import { HotelStatus } from "@prisma/client";
import { Log } from "@utils/logger";
import { gql } from "apollo-server-core";
import { mapSelections } from "graphql-map-selections";
import { Context } from "../../context";
import { HotelObject, toHotelSelect } from "./HotelObject";

type AllPublishedHotelsArgs = any;

type AllPublishedHotelsResult = HotelObject[];

type AllPublishedHotels = IFieldResolver<any, Context, AllPublishedHotelsArgs, Promise<AllPublishedHotelsResult>>;

const allPublishedHotels: AllPublishedHotels = async (_, __, { store }, info) => {
    const hotelSelect = toHotelSelect(mapSelections(info))?.select;

    const allPublishedHotels = await store.hotel.findMany({
        where: { status: "PUBLISHED" },
        select: hotelSelect,
    });

    Log(`allPublishedHotels: `, allPublishedHotels);

    return allPublishedHotels;
};

export const allPublishedHotelsTypeDefs = gql`
    type Query {
        allPublishedHotels: [HotelObject]
    }
`;

export const allPublishedHotelsResolvers = { Query: { allPublishedHotels } };
