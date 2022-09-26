import { IFieldResolver } from "@graphql-tools/utils";
import { HotelStatus } from "@prisma/client";
import { Log } from "@utils/logger";
import { gql } from "apollo-server-core";
import { mapSelections } from "graphql-map-selections";
import { Context } from "../../context";
import { GqlError } from "../../error";
import {
    createPaginationResult,
    createPaginationResultType,
    PaginationOption,
    PaginationResult,
} from "../core/pagination";
import { HotelObject, toHotelSelect } from "./HotelObject";

type MyHotelsFilterOptions = {
    status: HotelStatus[];
};

type MyHotelsArgs = {
    filter: MyHotelsFilterOptions;
    paginate: PaginationOption;
};

type MyHotelsResult = PaginationResult<HotelObject>;

type MyHotels = IFieldResolver<any, Context, MyHotelsArgs, Promise<MyHotelsResult>>;

const myHotels: MyHotels = async (_, { filter, paginate }, { authData, store }, info) => {
    const { accountId } = authData || { accountId: null };
    if (!accountId) throw new GqlError({ code: "FORBIDDEN", message: "Invalid token!!" });

    const { skip, take } = paginate || {};

    const hotelSelect = toHotelSelect(mapSelections(info))?.select;

    const myHotels = await store.hotel.findMany({
        where: { accountId, status: filter ? { in: filter.status } : undefined },
        select: hotelSelect,
        orderBy: { createdAt: "desc" },
        take: take && take + 1,
        skip,
    });

    Log(`filter: `, filter, `paginate: `, paginate, `myHotels: `, myHotels);

    return createPaginationResult(myHotels, take, skip);
};

export const myHotelsTypeDefs = gql`
    input MyHotelsFilterOptions {
        status: [HotelStatus]
    }

    ${createPaginationResultType("MyHotelsResult", "HotelObject")}

    type Query {
        myHotels(filter: MyHotelsFilterOptions, paginate: PaginationOption): MyHotelsResult @auth(requires: [host])
    }
`;

export const myHotelsResolvers = { Query: { myHotels } };
