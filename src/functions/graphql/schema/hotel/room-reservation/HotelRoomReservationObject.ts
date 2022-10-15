import { IObjectTypeResolver } from "@graphql-tools/utils";
import { HotelRoomReservation } from "@prisma/client";
import { Log } from "@utils/logger";
import { omit } from "@utils/object-helper";
import { gql } from "apollo-server-core";
import { PrismaSelect } from "graphql-map-selections";
import { isEmpty, merge } from "lodash";
import { Context } from "../../../context";
import { ProfileSelect, toProfileSelect } from "../../account/profile";
import { toTrasactionSelect, TransactionSelect } from "../../transaction/TransactionObject";
import { PackagePlanSelect, toPackagePlanSelect } from "../package-plan";
import { HotelRoomSelect, toHotelRoomSelect } from "../rooms";

export type HotelRoomReservationObject = Partial<HotelRoomReservation>;

export type HotelRoomReservationSelect = {
    id: boolean;
    reservationId: boolean;
    fromDateTime: boolean;
    toDateTime: boolean;
    status: boolean;
    remarks: boolean;
    approved: boolean;
    approvedOn: boolean;
    subscriptionUnit: boolean;
    subscriptionPrice: boolean;
    hotelRoom: PrismaSelect<HotelRoomSelect>;
    packagePlan: PrismaSelect<PackagePlanSelect>;
    reservee: PrismaSelect<ProfileSelect>;
    transaction: PrismaSelect<TransactionSelect>;
    createdAt: boolean;
    updatedAt: boolean;
};

export const toHotelRoomReservationSelect = (
    selections,
    defaultValue: any = false
): PrismaSelect<HotelRoomReservationSelect> => {
    if (!selections || isEmpty(selections)) return defaultValue;
    const hotelRoomSelect = toHotelRoomSelect(selections.hotelRoom);
    const packagePlanSelect = toPackagePlanSelect(selections.packagePlan);
    const reserveeSelect = toProfileSelect(selections.reservee);
    const transactionSelect = toTrasactionSelect(selections.transaction);
    const reservationSelect = omit(selections, "hotelRoom", "packagePlan", "reservee", "transaction");

    if (!reservationSelect && !hotelRoomSelect && !packagePlanSelect && !reserveeSelect && !transactionSelect)
        return defaultValue;

    return {
        select: {
            ...reservationSelect,
            hotelRoom: hotelRoomSelect,
            packagePlan: packagePlanSelect,
            reservee: reserveeSelect,
            transaction: transactionSelect,
        } as HotelRoomReservationSelect,
    };
};

const hotelRoomReservation: IObjectTypeResolver<any, Context> = {
    reservee: async ({ reservee }) => {
        if (!reservee) return;
        return merge(
            omit(reservee, "userProfile", "companyProfile"),
            { accountId: reservee.id },
            reservee.userProfile || reservee.companyProfile
        );
    },
};

export const hotelRoomReservationObjectTypeDefs = gql`
    type HotelRoomReservationObject {
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
        hotelRoom: HotelRoomObject
        packagePlan: PackagePlanObject
        reservee: Profile
        transaction: TransactionObject
    }
`;

export const hotelRoomReservationObjectResolvers = {
    HotelRoomReservationObject: hotelRoomReservation,
};
