import { ReservationStatus, Prisma } from "@prisma/client";
import { IFieldResolver } from "@graphql-tools/utils";
import { Log } from "@utils/logger";
import { gql } from "apollo-server-core";
import { mapSelections } from "graphql-map-selections";
import { Context } from "../../context";
import {
    createPaginationResult,
    createPaginationResultType,
    PaginationOption,
    PaginationResult,
} from "../core/pagination";
import { ReservationObject, toReservationSelect } from "./ReservationObject";
import { GqlError } from "../../error";

type ReservationsFilter = {
    sortOrder: Prisma.SortOrder;
    status: ReservationStatus[];
};

type ReservationsArgs = { spaceId: string; paginate: PaginationOption; filter: ReservationsFilter };

type ReservationsResult = Promise<PaginationResult<ReservationObject>>;

type Reservations = IFieldResolver<any, Context, ReservationsArgs, ReservationsResult>;

const reservations: Reservations = async (_, { spaceId: id, paginate, filter }, { authData, store }, info) => {
    const { accountId } = authData;

    const { take, skip } = paginate || {};

    const { sortOrder, status } = filter || { sortOrder: "desc" };

    const spaces = await store.space.findMany({
        where: { accountId, id },
        select: {
            reservations: {
                where: { status: status ? { in: status } : undefined },
                ...toReservationSelect(mapSelections(info).data),
                orderBy: { updatedAt: sortOrder },
                take: take && take + 1,
                skip,
            },
        },
    });

    if (!spaces) throw new GqlError({ code: "NOT_FOUND", message: "You don't have any hosted spaces" });

    const reservations = spaces
        .flatMap((space) => space.reservations)
        .sort((a, b) =>
            sortOrder === "desc"
                ? b.updatedAt.getTime() - a.updatedAt.getTime()
                : a.updatedAt.getTime() - b.updatedAt.getTime()
        );

    Log(reservations);

    return createPaginationResult(reservations, take, skip);
};

export const reservationsTypeDefs = gql`
    ${createPaginationResultType("ReservationsResult", "ReservationObject")}

    input ReservationsFilter {
        sortOrder: SortOrder
        status: [ReservationStatus]
    }

    type Query {
        reservations(spaceId: ID, paginate: PaginationOption, filter: ReservationsFilter): ReservationsResult
            @auth(requires: [host])
    }
`;

export const reservationsResolvers = {
    Query: { reservations },
};
