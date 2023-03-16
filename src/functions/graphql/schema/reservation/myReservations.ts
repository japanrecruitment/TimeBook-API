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

type MyReservationFilter = {
    sortOrder: Prisma.SortOrder;
    status: ReservationStatus[];
};

type MyReservationsArgs = { paginate: PaginationOption; filter: MyReservationFilter };

type MyReservationsResult = Promise<PaginationResult<ReservationObject>>;

type MyReservations = IFieldResolver<any, Context, MyReservationsArgs, MyReservationsResult>;

const myReservations: MyReservations = async (_, { paginate, filter }, { authData, store }, info) => {
    const { accountId } = authData;

    const { take, skip } = paginate || {};

    const { sortOrder, status } = filter || { sortOrder: "desc" };

    const myReservations = await store.reservation.findMany({
        where: { reserveeId: accountId, status: status ? { in: status } : undefined },
        ...toReservationSelect(mapSelections(info).data),
        orderBy: { createdAt: sortOrder },
        take: take && take + 1,
        skip,
    });

    Log(myReservations);

    return createPaginationResult(myReservations, take, skip);
};

export const myReservationsTypeDefs = gql`
    ${createPaginationResultType("MyReservationsResult", "ReservationObject")}

    input MyReservationFilter {
        sortOrder: SortOrder
        status: [ReservationStatus]
    }

    type Query {
        myReservations(paginate: PaginationOption, filter: MyReservationFilter): MyReservationsResult
            @auth(requires: [user])
    }
`;

export const myReservationsResolvers = {
    Query: { myReservations },
};
