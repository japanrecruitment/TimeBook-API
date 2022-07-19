import { IFieldResolver } from "@graphql-tools/utils";
import { Log } from "@utils/logger";
import { gql } from "apollo-server-core";
import { mapSelections } from "graphql-map-selections";
import { isEmpty } from "lodash";
import { Context } from "../../../context";
import { GqlError } from "../../../error";
import { UpdatePriceOverrideInput, validateUpdatePriceOverrideInput } from "../price-override";
import { PriceOverrideObject, toPriceOverrideSelect } from "../price-override";

type UpdatePriceOverrideInRoomPlanArgs = {
    input: UpdatePriceOverrideInput;
};

type UpdatePriceOverrideInRoomPlanResult = {
    message: string;
    priceOverride?: PriceOverrideObject;
};

type UpdatePriceOverrideInRoomPlan = IFieldResolver<
    any,
    Context,
    UpdatePriceOverrideInRoomPlanArgs,
    Promise<UpdatePriceOverrideInRoomPlanResult>
>;

const updatePriceOverrideInRoomPlan: UpdatePriceOverrideInRoomPlan = async (
    _,
    { input },
    { authData, store },
    info
) => {
    const { accountId } = authData || {};
    if (!accountId) throw new GqlError({ code: "FORBIDDEN", message: "Invalid token!!" });

    const { id, endDate, priceSchemeId, startDate } = validateUpdatePriceOverrideInput(input);

    const priceOverride = await store.priceOverride.findUnique({
        where: { id },
        select: {
            hotelRoom_packagePlan: {
                select: {
                    hotelRoom: { select: { hotel: { select: { accountId: true } } } },
                    priceOverrides:
                        endDate && startDate
                            ? {
                                  where: {
                                      id: { not: id },
                                      OR: [
                                          { AND: [{ startDate: { gte: startDate } }, { startDate: { lte: endDate } }] },
                                          { AND: [{ endDate: { gte: startDate } }, { endDate: { lte: endDate } }] },
                                      ],
                                  },
                              }
                            : undefined,
                },
            },
        },
    });
    if (!priceOverride || !priceOverride.hotelRoom_packagePlan?.hotelRoom?.hotel)
        throw new GqlError({ code: "NOT_FOUND", message: "Price override not found" });
    if (accountId !== priceOverride.hotelRoom_packagePlan.hotelRoom.hotel.accountId)
        throw new GqlError({ code: "FORBIDDEN", message: "You are not allowed to modify this hotel room" });
    if (!isEmpty(priceOverride.hotelRoom_packagePlan.priceOverrides))
        throw new GqlError({ code: "BAD_REQUEST", message: "Overlapping price override found." });

    if (priceSchemeId) {
        const priceScheme = await store.priceScheme.findUnique({ where: { id: priceSchemeId } });
        if (!priceScheme) throw new GqlError({ code: "NOT_FOUND", message: "Price scheme not found" });
    }

    const priceOverrideSelect = toPriceOverrideSelect(mapSelections(info)?.priceOverride)?.select;
    const newPriceOverride = await store.priceOverride.update({
        where: { id },
        data: {
            endDate,
            startDate,
            priceScheme: priceSchemeId ? { connect: { id: priceSchemeId } } : undefined,
        },
        select: priceOverrideSelect,
    });

    Log(newPriceOverride);

    return {
        message: "Successfully updated price override in hotel room",
        priceOverride: newPriceOverride,
    };
};

export const updatePriceOverrideInRoomPlanTypeDefs = gql`
    type UpdatePriceOverrideInRoomPlanResult {
        message: String!
        priceOverride: PriceOverrideObject
    }

    type Mutation {
        updatePriceOverrideInRoomPlan(input: UpdatePriceOverrideInput!): UpdatePriceOverrideInRoomPlanResult!
            @auth(requires: [host])
    }
`;

export const updatePriceOverrideInRoomPlanResolvers = { Mutation: { updatePriceOverrideInRoomPlan } };
