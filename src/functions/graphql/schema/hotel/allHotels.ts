import { IFieldResolver } from "@graphql-tools/utils";
import { HotelStatus } from "@prisma/client";
import { Log } from "@utils/logger";
import { gql } from "apollo-server-core";
import { mapSelections } from "graphql-map-selections";
import { Context } from "../../context";
import { HotelObject, toHotelSelect } from "./HotelObject";

type AllHotelsFilterOptions = {
    accountId: string;
    status: HotelStatus[];
};

type AllHotelsArgs = {
    filter: AllHotelsFilterOptions;
};

type AllHotelsResult = HotelObject[];

type AllHotels = IFieldResolver<any, Context, AllHotelsArgs, Promise<AllHotelsResult>>;

const allHotels: AllHotels = async (_, { filter }, { store }, info) => {
    const hotelSelect = toHotelSelect(mapSelections(info))?.select;

    const allHotels = await store.hotel.findMany({
        where: filter ? { ...filter, status: { in: filter.status } } : undefined,
        select: hotelSelect,
        orderBy: { createdAt: "desc" },
    });

    Log(`filter: `, filter, `allHotels: `, allHotels);

    return allHotels;
};

export const allHotelsTypeDefs = gql`
    input AllHotelsFilterOptions {
        accountId: ID
        status: [HotelStatus]
    }

    type Query {
        allHotels(filter: AllHotelsFilterOptions): [HotelObject] @auth(requires: [admin])
    }
`;

export const allHotelsResolvers = { Query: { allHotels } };
