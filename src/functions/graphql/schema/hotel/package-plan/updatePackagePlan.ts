import { IFieldResolver } from "@graphql-tools/utils";
import { HotelPaymentTerm } from "@prisma/client";
import { Log } from "@utils/logger";
import { gql } from "apollo-server-core";
import { mapSelections } from "graphql-map-selections";
import { isEmpty } from "lodash";
import { Context } from "src/functions/graphql/context";
import { GqlError } from "src/functions/graphql/error";
import { PackagePlanObject, toPackagePlanSelect } from "./PackagePlanObject";

function validateUpdatePackagePlanInput(input: UpdatePackagePlanInput): UpdatePackagePlanInput {
    let {
        cutOffBeforeDays,
        cutOffTillTime,
        description,
        endReservation,
        endUsage,
        name,
        startReservation,
        startUsage,
        stock,
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

    if (startUsage?.getTime() > endUsage?.getTime())
        throw new GqlError({ code: "BAD_USER_INPUT", message: "Invalid usage period" });

    if (startReservation?.getTime() > endReservation?.getTime())
        throw new GqlError({ code: "BAD_USER_INPUT", message: "Invalid reservation period" });

    if (cutOffBeforeDays && cutOffBeforeDays < 0)
        throw new GqlError({ code: "BAD_USER_INPUT", message: "Invalid cut off before days" });

    if (stock && stock < 0) throw new GqlError({ code: "BAD_USER_INPUT", message: "Invalid number of stock" });

    return {
        cutOffBeforeDays,
        description,
        endReservation,
        endUsage,
        name,
        startReservation,
        startUsage,
        stock,
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
};

type UpdatePackagePlanArgs = { input: UpdatePackagePlanInput };

type UpdatePackagePlanResult = {
    message: string;
    packagePlan?: PackagePlanObject;
};

type UpdatePackagePlan = IFieldResolver<any, Context, UpdatePackagePlanArgs, Promise<UpdatePackagePlanResult>>;

const updatePackagePlan: UpdatePackagePlan = async (_, { input }, { authData, dataSources, store }, info) => {
    const { accountId } = authData || {};
    if (!accountId) throw new GqlError({ code: "FORBIDDEN", message: "Invalid token!!" });

    const { id, ...data } = validateUpdatePackagePlanInput(input);

    const packagePlan = await store.packagePlan.findUnique({
        where: { id },
        select: { hotel: { select: { accountId: true } } },
    });
    if (!packagePlan || !packagePlan.hotel)
        throw new GqlError({ code: "NOT_FOUND", message: "Package plan not found" });
    if (accountId !== packagePlan.hotel.accountId)
        throw new GqlError({ code: "FORBIDDEN", message: "You are not allowed to modify this hotel package plan" });

    const packagePlanSelect = toPackagePlanSelect(mapSelections(info)?.packagePlan)?.select || { id: true };
    const updatedPackagePlan = await store.packagePlan.update({
        where: { id },
        data,
        select: {
            ...packagePlanSelect,
            hotel: {
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
            },
        },
    });

    Log("updatePackagePlan: ", updatedPackagePlan);

    const hotel = updatedPackagePlan?.hotel;
    if (hotel) {
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
        if (hotel.status === "PUBLISHED") {
            await dataSources.hotelAlgolia.partialUpdateObject({
                objectID: hotel.id,
                highestPrice,
                lowestPrice,
            });
        }
    }

    return {
        message: `Successfully updated package plan`,
        packagePlan: updatedPackagePlan,
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
