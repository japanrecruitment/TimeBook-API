import { Reservation } from "@prisma/client";
import { omit } from "@utils/object-helper";
import { gql } from "apollo-server-core";
import { PrismaSelect } from "graphql-map-selections";
import { isEmpty } from "lodash";
import { SpaceSelect, toSpaceSelect } from "../space/SpaceObject";

export type ReservationObject = Partial<Reservation>;

export type ReservationSelect = {
    id: boolean;
    fromDateTime: boolean;
    toDateTime: boolean;
    status: boolean;
    createdAt: boolean;
    updatedAt: boolean;
    approved: boolean;
    approvedOn: boolean;
    space: PrismaSelect<SpaceSelect>;
};

export const toReservationSelect = (selections, defaultValue: any = false): PrismaSelect<ReservationSelect> => {
    if (!selections || isEmpty(selections)) return defaultValue;
    const spaceSelect = toSpaceSelect(selections.space);
    const reservationSelect = omit(selections, "space");

    if (!reservationSelect && spaceSelect) return defaultValue;

    return {
        select: {
            ...reservationSelect,
            space: spaceSelect,
        } as ReservationSelect,
    };
};

export const reservationObjectTypeDefs = gql`
    type ReservationObject {
        id ID
        fromDateTime Date
        toDateTime Date
        status ReservationStatus
        createdAt Date
        updatedAt Date
        approved Boolean
        approvedOn Date
        space SpaceObject
    }
`;
