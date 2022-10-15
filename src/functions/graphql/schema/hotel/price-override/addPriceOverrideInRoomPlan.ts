import { IFieldResolver } from "@graphql-tools/utils";
import { Log } from "@utils/logger";
import { gql } from "apollo-server-core";
import { mapSelections } from "graphql-map-selections";
import { isEmpty } from "lodash";
import { Context } from "../../../context";
import { GqlError } from "../../../error";
import { AddPriceOverrideInput, validateAddPriceOverrideInput } from "../price-override";
import { PriceOverrideObject, toPriceOverrideSelect } from "../price-override";

type AddPriceOverrideInRoomPlanArgs = {
    roomPlanId: string;
    priceOverride: AddPriceOverrideInput;
};

type AddPriceOverrideInRoomPlanResult = {
    message: string;
    priceOverride?: PriceOverrideObject;
};

type AddPriceOverrideInRoomPlan = IFieldResolver<
    any,
    Context,
    AddPriceOverrideInRoomPlanArgs,
    Promise<AddPriceOverrideInRoomPlanResult>
>;

const addPriceOverrideInRoomPlan: AddPriceOverrideInRoomPlan = async (
    _,
    { roomPlanId, priceOverride },
    { authData, store },
    info
) => {
    const { accountId } = authData || {};
    if (!accountId) throw new GqlError({ code: "FORBIDDEN", message: "Invalid token!!" });

    const { endDate, priceSchemeId, startDate } = validateAddPriceOverrideInput(priceOverride);

    const roomPlan = await store.hotelRoom_PackagePlan.findUnique({
        where: { id: roomPlanId },
        select: {
            hotelRoom: {
                select: { hotel: { select: { accountId: true, priceSchemes: { where: { id: priceSchemeId } } } } },
            },
            priceOverrides: {
                where: {
                    OR: [
                        { AND: [{ startDate: { gte: startDate } }, { startDate: { lte: endDate } }] },
                        { AND: [{ endDate: { gte: startDate } }, { endDate: { lte: endDate } }] },
                    ],
                },
            },
        },
    });
    if (!roomPlan || !roomPlan.hotelRoom?.hotel)
        throw new GqlError({ code: "NOT_FOUND", message: "Room plan not found" });
    if (accountId !== roomPlan.hotelRoom.hotel.accountId)
        throw new GqlError({ code: "FORBIDDEN", message: "You are not allowed to modify this hotel room" });
    if (!isEmpty(roomPlan.priceOverrides))
        throw new GqlError({ code: "BAD_REQUEST", message: "Overlapping price override found." });
    if (isEmpty(roomPlan.hotelRoom.hotel.priceSchemes))
        throw new GqlError({ code: "NOT_FOUND", message: "Price scheme not found" });

    const priceOverrideSelect = toPriceOverrideSelect(mapSelections(info)?.priceOverride)?.select;
    const newPriceOverride = await store.priceOverride.create({
        data: {
            endDate,
            startDate,
            hotelRoom_packagePlan: { connect: { id: roomPlanId } },
            priceScheme: { connect: { id: priceSchemeId } },
        },
        select: priceOverrideSelect,
    });

    Log(newPriceOverride);

    return {
        message: "Successfully added price override in room plan",
        priceOverride: newPriceOverride,
    };
};

export const addPriceOverrideInRoomPlanTypeDefs = gql`
    type AddPriceOverrideInRoomPlanResult {
        message: String!
        priceOverride: PriceOverrideObject
    }

    type Mutation {
        addPriceOverrideInRoomPlan(
            roomPlanId: ID!
            priceOverride: AddPriceOverrideInput!
        ): AddPriceOverrideInRoomPlanResult! @auth(requires: [host])
    }
`;

export const addPriceOverrideInRoomPlanResolvers = { Mutation: { addPriceOverrideInRoomPlan } };
