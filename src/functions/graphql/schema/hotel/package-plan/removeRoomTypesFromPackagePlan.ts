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
    if (!accountId) throw new GqlError({ code: "FORBIDDEN", message: "Invalid token!!" });

    roomTypesIds = roomTypesIds && roomTypesIds.length > 0 ? roomTypesIds : undefined;

    const packagePlan = await store.packagePlan.findUnique({
        where: { id: packagePlanId },
        select: {
            hotel: { select: { accountId: true, status: true } },
            roomTypes: { where: { id: { in: roomTypesIds } }, select: { id: true } },
        },
    });
    if (!packagePlan || !packagePlan.hotel)
        throw new GqlError({ code: "NOT_FOUND", message: "Package plan not found" });
    if (accountId !== packagePlan.hotel.accountId)
        throw new GqlError({ code: "FORBIDDEN", message: "You are not allowed to modify this hotel package plan" });

    if (isEmpty(packagePlan.roomTypes)) throw new GqlError({ code: "NOT_FOUND", message: "Nearest station not found" });

    const roomTypesToRemove = roomTypesIds
        ? intersectionWith(roomTypesIds, packagePlan.roomTypes, (a, b) => a === b.id)
        : packagePlan.roomTypes.map(({ id }) => id);

    const updatedPackagePlan = await store.packagePlan.update({
        where: { id: packagePlanId },
        data: { roomTypes: { deleteMany: { packagePlanId, id: { in: roomTypesToRemove } } } },
        select: {
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
        let lowestPrice = 0;
        hotel.packagePlans.forEach(({ paymentTerm, roomTypes }) => {
            const selector = paymentTerm === "PER_PERSON" ? "oneAdultCharge" : "roomCharge";
            roomTypes.forEach(({ priceSettings }, index) => {
                priceSettings.forEach(({ priceScheme }) => {
                    if (index === 0) lowestPrice = priceScheme[selector];
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

    return { message: `Successfully removed ${roomTypesToRemove.length} room type from package plan` };
};

export const removeRoomTypesFromPackagePlanTypeDefs = gql`
    type Mutation {
        removeRoomTypesFromPackagePlan(packagePlanId: ID!, roomTypesIds: [ID]): Result @auth(requires: [host])
    }
`;

export const removeRoomTypesFromPackagePlanResolvers = { Mutation: { removeRoomTypesFromPackagePlan } };
