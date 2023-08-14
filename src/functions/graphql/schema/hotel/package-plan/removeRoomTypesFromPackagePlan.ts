import { IFieldResolver } from "@graphql-tools/utils";
import { Log } from "@utils/logger";
import { gql } from "apollo-server-core";
import { intersectionWith, isEmpty } from "lodash";
import { Context } from "../../../context";
import { GqlError } from "../../../error";
import { Result } from "../../core/result";

type RemoveRoomTypesFromPackagePlanArgs = { packagePlanId: string; roomTypesIds: string[] };

type RemoveRoomTypesFromPackagePlanResult = Result;

type RemoveRoomTypesFromPackagePlan = IFieldResolver<
    any,
    Context,
    RemoveRoomTypesFromPackagePlanArgs,
    Promise<RemoveRoomTypesFromPackagePlanResult>
>;

const removeRoomTypesFromPackagePlan: RemoveRoomTypesFromPackagePlan = async (
    _,
    { packagePlanId, roomTypesIds },
    { authData, dataSources, store }
) => {
    const { accountId } = authData || {};
    if (!accountId) throw new GqlError({ code: "FORBIDDEN", message: "無効なリクエスト" });

    roomTypesIds = roomTypesIds && roomTypesIds.length > 0 ? roomTypesIds : undefined;

    const packagePlan = await store.packagePlan.findUnique({
        where: { id: packagePlanId },
        select: {
            hotel: { select: { accountId: true, status: true } },
            roomTypes: { where: { id: { in: roomTypesIds } }, select: { id: true } },
        },
    });
    if (!packagePlan || !packagePlan.hotel)
        throw new GqlError({ code: "NOT_FOUND", message: "プランが見つかりません。" });
    if (accountId !== packagePlan.hotel.accountId)
        throw new GqlError({ code: "FORBIDDEN", message: "無効なリクエスト" });

    if (isEmpty(packagePlan.roomTypes)) throw new GqlError({ code: "NOT_FOUND", message: "無効な部屋タイプ" });

    const roomTypesToRemove = roomTypesIds
        ? intersectionWith(roomTypesIds, packagePlan.roomTypes, (a, b) => a === b.id)
        : packagePlan.roomTypes.map(({ id }) => id);

    const updatedPackagePlan = await store.packagePlan.update({
        where: { id: packagePlanId },
        data: { roomTypes: { deleteMany: { packagePlanId, id: { in: roomTypesToRemove } } } },
        select: {
            id: true,
            hotel:
                packagePlan.hotel.status === "PUBLISHED"
                    ? {
                          select: {
                              id: true,
                              packagePlans: {
                                  select: {
                                      paymentTerm: true,
                                      roomTypes: { select: { priceSettings: { select: { priceScheme: true } } } },
                                  },
                              },
                              status: true,
                          },
                      }
                    : undefined,
        },
    });

    Log(updatedPackagePlan);

    const hotel = updatedPackagePlan?.hotel;
    if (hotel && hotel.status === "PUBLISHED") {
        let highestPrice = 0;
        let lowestPrice = 9999999999;
        hotel.packagePlans.forEach(({ paymentTerm, roomTypes }) => {
            const selector = paymentTerm === "PER_PERSON" ? "oneAdultCharge" : "roomCharge";
            roomTypes.forEach(({ priceSettings }, index) => {
                priceSettings.forEach(({ priceScheme }) => {
                    if (priceScheme[selector] > highestPrice) highestPrice = priceScheme[selector];
                    if (priceScheme[selector] < lowestPrice) lowestPrice = priceScheme[selector];
                });
            });
        });
        await dataSources.hotelAlgolia.partialUpdateObject({
            objectID: hotel.id,
            highestPrice,
            lowestPrice,
        });
    }

    return { message: `${roomTypesToRemove.length}部屋タイプをパッケージ プランから削除しました` };
};

export const removeRoomTypesFromPackagePlanTypeDefs = gql`
    type Mutation {
        removeRoomTypesFromPackagePlan(packagePlanId: ID!, roomTypesIds: [ID]): Result @auth(requires: [host])
    }
`;

export const removeRoomTypesFromPackagePlanResolvers = { Mutation: { removeRoomTypesFromPackagePlan } };
