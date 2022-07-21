import { IFieldResolver } from "@graphql-tools/utils";
import { HotelStatus } from "@prisma/client";
import { Log } from "@utils/logger";
import { gql } from "apollo-server-core";
import { mapSelections } from "graphql-map-selections";
import { Context } from "../../context";
import { GqlError } from "../../error";
import { HotelObject, toHotelSelect } from "./HotelObject";

type MyHotelsFilterOptions = {
    status: HotelStatus[];
};

type MyHotelsArgs = {
    filter: MyHotelsFilterOptions;
};

type MyHotelsResult = HotelObject[];

type MyHotels = IFieldResolver<any, Context, MyHotelsArgs, Promise<MyHotelsResult>>;

const myHotels: MyHotels = async (_, { filter }, { authData, store }, info) => {
    const { accountId } = authData || {};
    if (!accountId) throw new GqlError({ code: "FORBIDDEN", message: "Invalid token!!" });

    const hotelSelect = toHotelSelect(mapSelections(info))?.select;

    const myHotels = await store.hotel.findMany({
        where: { accountId, status: filter ? { in: filter.status } : undefined },
        select: hotelSelect,
        orderBy: { createdAt: "desc" },
    });

    Log(`filter: `, filter, `myHotels: `, myHotels);

    return myHotels;
};

export const myHotelsTypeDefs = gql`
    input MyHotelsFilterOptions {
        status: [HotelStatus]
    }

    type Query {
        myHotels(filter: MyHotelsFilterOptions): [HotelObject] @auth(requires: [host])
    }
`;

export const myHotelsResolvers = { Query: { myHotels } };
