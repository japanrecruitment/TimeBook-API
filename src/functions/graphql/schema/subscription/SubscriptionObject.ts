import { IObjectTypeResolver } from "@graphql-tools/utils";
import { Log } from "@utils/logger";
import { gql } from "apollo-server-core";
import { sum } from "lodash";
import { Context } from "../../context";

export type SubscriptionObject = {
    id: string;
    amount: number;
    currentPeriodEnd: Date;
    currentPeriodStart: Date;
    isCanceled: boolean;
    name: string;
    priceType: string;
    type: string;
    unit: number;
    canceledAt?: Date;
    endsAt?: Date;
    remainingUnit?: number;
};

export const subscriptionObjectTypeDefs = gql`
    type SubscriptionObject {
        id: ID
        amount: Int
        canceledAt: Date
        currentPeriodEnd: Date
        currentPeriodStart: Date
        endsAt: Date
        isCanceled: Boolean
        name: String
        priceType: String
        remainingUnit: Int @auth(requires: [user])
        type: String
        unit: Int
    }
`;

export const subscriptionObjectResolvers = {
    SubscriptionObject: {
        remainingUnit: async (
            { currentPeriodEnd, currentPeriodStart, remainingUnit, type, unit },
            __,
            { authData, store }
        ) => {
            Log(authData);
            const { accountId } = authData || {};
            if (!accountId) return;
            if (remainingUnit) return remainingUnit;
            if (type === "hotel") {
                const reservations = await store.hotelRoomReservation.aggregate({
                    where: {
                        reserveeId: accountId,
                        subscriptionUnit: { not: null },
                        subscriptionPrice: { not: null },
                        OR: [
                            {
                                AND: [
                                    { fromDateTime: { gte: currentPeriodStart } },
                                    { fromDateTime: { lte: currentPeriodEnd } },
                                ],
                            },
                            {
                                AND: [
                                    { toDateTime: { gte: currentPeriodStart } },
                                    { toDateTime: { lte: currentPeriodEnd } },
                                ],
                            },
                        ],
                    },
                    _sum: { subscriptionUnit: true },
                });
                return unit - reservations?._sum?.subscriptionUnit || 0;
            }
            const reservations = await store.reservation.aggregate({
                where: {
                    reserveeId: accountId,
                    subscriptionUnit: { not: null },
                    subscriptionPrice: { not: null },
                    OR: [
                        {
                            AND: [
                                { fromDateTime: { gte: currentPeriodStart } },
                                { fromDateTime: { lte: currentPeriodEnd } },
                            ],
                        },
                        {
                            AND: [
                                { toDateTime: { gte: currentPeriodStart } },
                                { toDateTime: { lte: currentPeriodEnd } },
                            ],
                        },
                    ],
                },
                _sum: { subscriptionUnit: true },
            });
            return unit - reservations?._sum?.subscriptionUnit || 0;
        },
    } as IObjectTypeResolver<SubscriptionObject, Context>,
};
