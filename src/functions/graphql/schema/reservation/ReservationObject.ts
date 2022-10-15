import { IObjectTypeResolver } from "@graphql-tools/utils";
import { Reservation } from "@prisma/client";
import { omit } from "@utils/object-helper";
import { gql } from "apollo-server-core";
import { PrismaSelect } from "graphql-map-selections";
import { isEmpty, merge } from "lodash";
import { SpaceSelect, toSpaceSelect } from "../space/SpaceObject";
import { toTrasactionSelect, TransactionSelect } from "../transaction/TransactionObject";
import { ProfileSelect, toProfileSelect } from "../account/profile";
import { Context } from "../../context";

export type ReservationObject = Partial<Reservation>;

export type ReservationSelect = {
    id: boolean;
    reservationId: boolean;
    fromDateTime: boolean;
    toDateTime: boolean;
    status: boolean;
    createdAt: boolean;
    updatedAt: boolean;
    approved: boolean;
    approvedOn: boolean;
    subscriptionUnit: boolean;
    subscriptionPrice: boolean;
    reservee: PrismaSelect<ProfileSelect>;
    transaction: PrismaSelect<TransactionSelect>;
    space: PrismaSelect<SpaceSelect>;
};

export const toReservationSelect = (selections, defaultValue: any = false): PrismaSelect<ReservationSelect> => {
    if (!selections || isEmpty(selections)) return defaultValue;
    const spaceSelect = toSpaceSelect(selections.space);
    const transactionSelect = toTrasactionSelect(selections.transaction);
    const reserveeSelect = toProfileSelect(selections.reservee);
    const reservationSelect = omit(selections, "space", "transaction");

    if (!reservationSelect && !spaceSelect && !transactionSelect && !reserveeSelect) return defaultValue;

    return {
        select: {
            ...reservationSelect,
            space: spaceSelect,
            reservee: reserveeSelect,
            transaction: transactionSelect,
        } as ReservationSelect,
    };
};

const reservationResolver: IObjectTypeResolver<any, Context> = {
    reservee: async ({ reservee }) => {
        if (!reservee) return;
        return merge(
            omit(reservee, "userProfile", "companyProfile"),
            { accountId: reservee.id },
            reservee.userProfile || reservee.companyProfile
        );
    },
};

export const reservationObjectTypeDefs = gql`
    type ReservationObject {
        id: ID
        reservationId: String
        fromDateTime: Date
        toDateTime: Date
        status: ReservationStatus
        createdAt: Date
        updatedAt: Date
        approved: Boolean
        approvedOn: Date
        subscriptionUnit: Int
        subscriptionPrice: Int
        reservee: Profile
        space: SpaceObject
        transaction: TransactionObject
    }
`;

export const reservationObjectResolvers = {
    ReservationObject: reservationResolver,
};
