import { ReservationStatus, Prisma } from "@prisma/client";
import { IFieldResolver } from "@graphql-tools/utils";
import { Log } from "@utils/logger";
import { gql } from "apollo-server-core";
import { mapSelections } from "graphql-map-selections";
import {
    createPaginationResult,
    createPaginationResultType,
    PaginationOption,
    PaginationResult,
} from "../../core/pagination";
import { HotelRoomReservationObject, toHotelRoomReservationSelect } from "./HotelRoomReservationObject";
import { Context } from "src/functions/graphql/context";

type MyHotelRoomReservationFilter = {
    sortOrder: Prisma.SortOrder;
    status: ReservationStatus;
};

type MyHotelRoomReservationArgs = { paginate: PaginationOption; filter: MyHotelRoomReservationFilter };

type MyHotelRoomReservationResult = Promise<PaginationResult<HotelRoomReservationObject>>;

type MyHotelRoomReservation = IFieldResolver<any, Context, MyHotelRoomReservationArgs, MyHotelRoomReservationResult>;

const myHotelRoomReservation: MyHotelRoomReservation = async (_, { paginate, filter }, { authData, store }, info) => {
    const { accountId } = authData;

    const { take, skip } = paginate || {};

    const { sortOrder, status } = filter || { sortOrder: "desc" };

    const hotelRoomReservationSelect = toHotelRoomReservationSelect(mapSelections(info)?.data)?.select;
    const myHotelRoomReservation = await store.hotelRoomReservation.findMany({
        where: { reserveeId: accountId, status },
        select: hotelRoomReservationSelect,
        orderBy: { updatedAt: sortOrder },
        take: take && take + 1,
        skip,
    });

    Log(myHotelRoomReservation);

    return createPaginationResult(myHotelRoomReservation, take, skip);
};

export const myHotelRoomReservationTypeDefs = gql`
    ${createPaginationResultType("MyHotelRoomReservationResult", "HotelRoomReservationObject")}

    input MyHotelRoomReservationFilter {
        sortOrder: SortOrder
        status: ReservationStatus
    }

    type Query {
        myHotelRoomReservation(
            paginate: PaginationOption
            filter: MyHotelRoomReservationFilter
        ): MyHotelRoomReservationResult @auth(requires: [user])
    }
`;

export const myHotelRoomReservationResolvers = {
    Query: { myHotelRoomReservation },
};
