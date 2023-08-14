import { IFieldResolver } from "@graphql-tools/utils";
import { HotelPaymentTerm } from "@prisma/client";
import { Log } from "@utils/logger";
import { gql } from "apollo-server-core";
import { mapSelections } from "graphql-map-selections";
import { differenceWith, isEmpty } from "lodash";
import { Context } from "src/functions/graphql/context";
import { GqlError } from "src/functions/graphql/error";
import { PackagePlanObject, toPackagePlanSelect } from "./PackagePlanObject";

function validateUpdatePackagePlanInput(input: UpdatePackagePlanInput): UpdatePackagePlanInput {
    let {
        additionalOptions,
        cancelPolicyId,
        cutOffBeforeDays,
        cutOffTillTime,
        description,
        endReservation,
        endUsage,
        includedOptions,
        name,
        startReservation,
        startUsage,
        stock,
        subcriptionPrice,
        ...others
    } = input;

    description = description?.trim();
    name = name?.trim();

    if (isEmpty(description)) description = undefined;
    if (isEmpty(name)) name = undefined;
    if (!startUsage) startUsage = null;
    if (!endUsage) endUsage = null;
    if (!startReservation) startReservation = null;
    if (!endReservation) endReservation = null;
    if (!cutOffBeforeDays) cutOffBeforeDays = null;
    if (!cutOffTillTime) cutOffTillTime = null;
    if (!cancelPolicyId) cancelPolicyId = null;
    if (!subcriptionPrice) subcriptionPrice = null;

    if ((startUsage && !endUsage) || (!startUsage && endUsage))
        throw new GqlError({ code: "BAD_USER_INPUT", message: "使用開始期間と終了期間の両方を提供する" });

    if (startUsage?.getTime() > endUsage?.getTime())
        throw new GqlError({ code: "BAD_USER_INPUT", message: "利用期間が無効です" });

    if ((startReservation && !endReservation) || (!startReservation && endReservation))
        throw new GqlError({ code: "BAD_USER_INPUT", message: "予約開始期間と予約終了期間の両方を提供する" });

    if (startReservation?.getTime() > endReservation?.getTime())
        throw new GqlError({ code: "BAD_USER_INPUT", message: "予約期間が無効です" });

    if (cutOffBeforeDays && cutOffBeforeDays < 0)
        throw new GqlError({ code: "BAD_USER_INPUT", message: "数日前の無効なカットオフ" });

    if (stock && stock < 0) throw new GqlError({ code: "BAD_USER_INPUT", message: "在庫数が無効です" });

    if (subcriptionPrice && subcriptionPrice < 0)
        throw new GqlError({ code: "BAD_USER_INPUT", message: "無効なサブスクリプション価格" });

    return {
        additionalOptions,
        cancelPolicyId,
        cutOffBeforeDays,
        cutOffTillTime,
        description,
        endReservation,
        endUsage,
        includedOptions,
        name,
        startReservation,
        startUsage,
        stock,
        subcriptionPrice,
        ...others,
    };
}

type UpdatePackagePlanInput = {
    id: string;
    name?: string;
    description?: string;
    paymentTerm?: HotelPaymentTerm;
    stock?: number;
    startUsage?: Date;
    endUsage?: Date;
    startReservation?: Date;
    endReservation?: Date;
    cutOffBeforeDays?: number;
    cutOffTillTime?: Date;
    isBreakfastIncluded?: boolean;
    subcriptionPrice?: number;
    cancelPolicyId?: string;
    includedOptions?: string[];
    additionalOptions?: string[];
};

type UpdatePackagePlanArgs = { input: UpdatePackagePlanInput };

type UpdatePackagePlanResult = {
    message: string;
    packagePlan?: PackagePlanObject;
};

type UpdatePackagePlan = IFieldResolver<any, Context, UpdatePackagePlanArgs, Promise<UpdatePackagePlanResult>>;

const updatePackagePlan: UpdatePackagePlan = async (_, { input }, { authData, dataSources, store }, info) => {
    const { accountId } = authData || {};
    if (!accountId) throw new GqlError({ code: "FORBIDDEN", message: "無効なリクエスト" });

    const { id, additionalOptions, includedOptions, ...data } = validateUpdatePackagePlanInput(input);

    const packagePlan = await store.packagePlan.findUnique({
        where: { id },
        select: {
            hotel: { select: { accountId: true, status: true } },
            additionalOptions: { select: { id: true } },
            includedOptions: { select: { id: true } },
        },
    });
    if (!packagePlan || !packagePlan.hotel)
        throw new GqlError({ code: "NOT_FOUND", message: "プランが見つかりません" });
    if (accountId !== packagePlan.hotel.accountId)
        throw new GqlError({ code: "FORBIDDEN", message: "無効なリクエスト" });

    const packagePlanSelect = toPackagePlanSelect(mapSelections(info)?.packagePlan)?.select || {
        id: true,
        includedOptions: { select: { id: true } },
        additionalOptions: { select: { id: true } },
    };
    const updatedPackagePlan = await store.packagePlan.update({
        where: { id },
        data,
        select: {
            ...packagePlanSelect,
            id: true,
            includedOptions: false,
            additionalOptions: false,
            hotel:
                packagePlan.hotel.status === "PUBLISHED"
                    ? {
                          select: {
                              id: true,
                              packagePlans: {
                                  select: {
                                      isBreakfastIncluded: true,
                                      paymentTerm: true,
                                      roomTypes: { select: { priceSettings: { select: { priceScheme: true } } } },
                                      subcriptionPrice: true,
                                  },
                              },
                              status: true,
                          },
                      }
                    : undefined,
        },
    });

    const includedOptionsToAdd = differenceWith(includedOptions, packagePlan.includedOptions, (a, b) => a === b.id);
    const includedOptionsToRemove = differenceWith(packagePlan.includedOptions, includedOptions, (a, b) => a.id === b);
    let includedOptionsResult = [];
    if (!isEmpty(includedOptionsToAdd)) {
        includedOptionsResult = await Promise.all(
            includedOptionsToAdd.map((id) =>
                store.option.update({
                    where: { id },
                    data: { inPackagePlans: { connect: { id: updatedPackagePlan.id } } },
                    select: packagePlanSelect.includedOptions.select,
                })
            )
        );
    }
    if (!isEmpty(includedOptionsToRemove)) {
        await Promise.all(
            includedOptionsToRemove.map(({ id }) =>
                store.option.update({
                    where: { id },
                    data: { inPackagePlans: { disconnect: { id: updatedPackagePlan.id } } },
                    select: packagePlanSelect.additionalOptions.select,
                })
            )
        );
    }

    const additionalOptionsToAdd = differenceWith(
        additionalOptions,
        packagePlan.additionalOptions,
        (a, b) => a === b.id
    );
    const additionalOptionsToRemove = differenceWith(
        packagePlan.additionalOptions,
        additionalOptions,
        (a, b) => a.id === b
    );
    let additionalOptionsResult = [];
    if (!isEmpty(additionalOptionsToAdd)) {
        additionalOptionsResult = await Promise.all(
            additionalOptionsToAdd.map((id) =>
                store.option.update({
                    where: { id },
                    data: { adPackagePlans: { connect: { id: updatedPackagePlan.id } } },
                    select: packagePlanSelect.includedOptions.select,
                })
            )
        );
    }
    if (!isEmpty(additionalOptionsToRemove)) {
        await Promise.all(
            additionalOptionsToRemove.map(({ id }) =>
                store.option.update({
                    where: { id },
                    data: { adPackagePlans: { disconnect: { id: updatedPackagePlan.id } } },
                    select: packagePlanSelect.additionalOptions.select,
                })
            )
        );
    }

    Log("updatePackagePlan: ", updatedPackagePlan);

    const hotel = updatedPackagePlan?.hotel;
    if (hotel && hotel.status === "PUBLISHED") {
        let highestPrice = 0;
        let lowestPrice = 9999999999;
        hotel.packagePlans.forEach(({ paymentTerm, roomTypes }) => {
            const selector = paymentTerm === "PER_PERSON" ? "oneAdultCharge" : "roomCharge";
            roomTypes.forEach(({ priceSettings }) => {
                priceSettings.forEach(({ priceScheme }, index) => {
                    if (priceScheme[selector] > highestPrice) highestPrice = priceScheme[selector];
                    if (priceScheme[selector] < lowestPrice) lowestPrice = priceScheme[selector];
                });
            });
        });
        await dataSources.hotelAlgolia.partialUpdateObject({
            objectID: hotel.id,
            highestPrice,
            lowestPrice,
            isBreakfastIncluded: hotel.packagePlans.some(({ isBreakfastIncluded }) => isBreakfastIncluded),
            subcriptionPrice: hotel.packagePlans.map(({ subcriptionPrice }) => subcriptionPrice),
        });
    }

    return {
        message: `プランが更新されました`,
        packagePlan: {
            ...updatedPackagePlan,
            additionalOptions: additionalOptionsResult,
            includedOptions: includedOptionsResult,
        },
    };
};

export const updatePackagePlanTypeDefs = gql`
    input UpdatePackagePlanInput {
        id: ID!
        name: String
        description: String
        paymentTerm: HotelPaymentTerm
        stock: Int
        startUsage: Date
        endUsage: Date
        startReservation: Date
        endReservation: Date
        cutOffBeforeDays: Int
        cutOffTillTime: Time
        isBreakfastIncluded: Boolean
        subcriptionPrice: Int
        cancelPolicyId: ID
        includedOptions: [ID]
        additionalOptions: [ID]
    }

    type UpdatePackagePlanResult {
        message: String!
        packagePlan: PackagePlanObject
    }

    type Mutation {
        updatePackagePlan(input: UpdatePackagePlanInput!): UpdatePackagePlanResult @auth(requires: [host])
    }
`;

export const updatePackagePlanResolvers = { Mutation: { updatePackagePlan } };
