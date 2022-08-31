import { IObjectTypeResolver } from "@graphql-tools/utils";
import { StripeSubscription } from "@libs/paymentProvider";
import { Log } from "@utils/logger";
import { gql } from "apollo-server-core";
import { isEmpty } from "lodash";
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

export function mapStripeSubscriptionToSubscriptionObject(subscription: StripeSubscription): SubscriptionObject {
    if (!subscription) return;
    const stripePrice = subscription.items.data[0].price;
    const stripeProduct = stripePrice.product;
    return {
        id: subscription.metadata?.id,
        amount: stripePrice.unit_amount,
        canceledAt: subscription.canceled_at && new Date(subscription.canceled_at),
        currentPeriodEnd: subscription.current_period_end && new Date(subscription.current_period_end),
        currentPeriodStart: subscription.current_period_start && new Date(subscription.current_period_start),
        endsAt: subscription.cancel_at && new Date(subscription.cancel_at),
        isCanceled: !isEmpty(subscription.cancel_at) || !isEmpty(subscription.canceled_at),
        name: stripeProduct.metadata.name,
        priceType: stripePrice.metadata.name,
        type: stripeProduct.metadata.type,
        unit: parseInt(stripePrice.product.metadata.unit),
    };
}

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
        canceledAt: ({ canceledAt }) => canceledAt && new Date(canceledAt.getTime() * 1000),
        currentPeriodEnd: ({ currentPeriodEnd }) => currentPeriodEnd && new Date(currentPeriodEnd.getTime() * 1000),
        currentPeriodStart: ({ currentPeriodStart }) =>
            currentPeriodStart && new Date(currentPeriodStart.getTime() * 1000),
        endsAt: ({ endsAt }) => endsAt && new Date(endsAt.getTime() * 1000),
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
                        status: { notIn: ["HOLD", "CANCELED", "DISAPPROVED", "FAILED"] },
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
                    status: { notIn: ["HOLD", "CANCELED", "DISAPPROVED", "FAILED"] },
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
