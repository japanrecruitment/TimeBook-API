import { ReservationStatus, Prisma } from "@prisma/client";
import { IFieldResolver } from "@graphql-tools/utils";
import { Log } from "@utils/logger";
import { gql } from "apollo-server-core";
import { mapSelections } from "graphql-map-selections";
import { Context } from "../../../context";
import {
    createPaginationResult,
    createPaginationResultType,
    PaginationOption,
    PaginationResult,
} from "../../core/pagination";
import { HotelRoomReservationObject, toHotelRoomReservationSelect } from "./HotelRoomReservationObject";
import { GqlError } from "../../../error";
import { unionWith, uniqWith } from "lodash";

type HotelRoomReservationsFilter = {
    sortOrder: Prisma.SortOrder;
    status: ReservationStatus;
};

type HotelRoomReservationsArgs = { hotelId: string; paginate: PaginationOption; filter: HotelRoomReservationsFilter };

type HotelRoomReservationsResult = Promise<PaginationResult<HotelRoomReservationObject>>;

type Reservations = IFieldResolver<any, Context, HotelRoomReservationsArgs, HotelRoomReservationsResult>;

const hotelRoomReservations: Reservations = async (_, { hotelId: id, paginate, filter }, { authData, store }, info) => {
    const { accountId } = authData;

    const { take, skip } = paginate || {};

    const { sortOrder, status } = filter || { sortOrder: "desc" };

    const hotelRoomReservationSelect = toHotelRoomReservationSelect(mapSelections(info)?.data)?.select;
    const hotel = await store.hotel.findMany({
        where: { accountId, id },
        select: {
            rooms: {
                select: {
                    reservations: {
                        where: { status },
                        select: { ...hotelRoomReservationSelect, updatedAt: true },
                        orderBy: { updatedAt: sortOrder },
                        take: take && take + 1,
                        skip,
                    },
                },
            },
            packagePlans: {
                select: {
                    reservations: {
                        where: { status },
                        select: { ...hotelRoomReservationSelect, updatedAt: true },
                        orderBy: { updatedAt: sortOrder },
                        take: take && take + 1,
                        skip,
                    },
                },
            },
        },
    });

    if (!hotel) throw new GqlError({ code: "NOT_FOUND", message: "You don't have any hosted spaces" });

    const hotelRoomReservations = hotel
        .flatMap(({ packagePlans, rooms }) => {
            const reservations = packagePlans
                .flatMap(({ reservations }) => reservations)
                .concat(rooms.flatMap(({ reservations }) => reservations));
            return unionWith(reservations, (a, b) => a.id === b.id);
        })
        .sort((a, b) => {
            return sortOrder === "desc"
                ? b.updatedAt?.getTime() - a.updatedAt?.getTime()
                : a.updatedAt?.getTime() - b.updatedAt?.getTime();
        });

    Log(hotelRoomReservations);

    return createPaginationResult(hotelRoomReservations, take, skip);
};

export const hotelRoomReservationsTypeDefs = gql`
    ${createPaginationResultType("HotelRoomReservationsResult", "HotelRoomReservationObject")}

    input HotelRoomReservationsFilter {
        sortOrder: SortOrder
        status: ReservationStatus
    }

    type Query {
        hotelRoomReservations(
            hotelId: ID
            paginate: PaginationOption
            filter: HotelRoomReservationsFilter
        ): HotelRoomReservationsResult @auth(requires: [host])
    }
`;

export const hotelRoomReservationsResolvers = {
    Query: { hotelRoomReservations },
};
