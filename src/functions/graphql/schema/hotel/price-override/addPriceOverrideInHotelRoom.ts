import { IFieldResolver } from "@graphql-tools/utils";
import { Log } from "@utils/logger";
import { gql } from "apollo-server-core";
import { mapSelections } from "graphql-map-selections";
import { Context } from "../../../context";
import { GqlError } from "../../../error";
import { AddPriceOverrideInput, validateAddPriceOverrideInput } from "../price-override";
import { PriceOverrideObject, toPriceOverrideSelect } from "../price-override";

type AddPriceOverrideInHotelRoomArgs = {
    hotelRoomId: string;
    priceOverride: AddPriceOverrideInput;
};

type AddPriceOverrideInHotelRoomResult = {
    message: string;
    priceOverride?: PriceOverrideObject;
};

type AddPriceOverrideInHotelRoom = IFieldResolver<
    any,
    Context,
    AddPriceOverrideInHotelRoomArgs,
    Promise<AddPriceOverrideInHotelRoomResult>
>;

const addPriceOverrideInHotelRoom: AddPriceOverrideInHotelRoom = async (
    _,
    { hotelRoomId, priceOverride },
    { authData, store },
    info
) => {
    const { accountId } = authData || {};
    if (!accountId) throw new GqlError({ code: "FORBIDDEN", message: "Invalid token!!" });

    const { endDate, priceSchemeId, startDate } = validateAddPriceOverrideInput(priceOverride);

    const hotelRoom = await store.hotelRoom.findUnique({
        where: { id: hotelRoomId },
        select: {
            hotel: { select: { accountId: true } },
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
    if (!hotelRoom || !hotelRoom.hotel) throw new GqlError({ code: "NOT_FOUND", message: "Hotel room not found" });
    if (accountId !== hotelRoom.hotel.accountId)
        throw new GqlError({ code: "FORBIDDEN", message: "You are not allowed to modify this hotel room" });
    if (hotelRoom.priceOverrides.length > 0)
        throw new GqlError({ code: "BAD_REQUEST", message: "Overlapping price override found." });
    const priceScheme = await store.priceScheme.findUnique({ where: { id: priceSchemeId } });
    if (!priceScheme) throw new GqlError({ code: "NOT_FOUND", message: "Price scheme not found" });

    const priceOverrideSelect = toPriceOverrideSelect(mapSelections(info)?.priceOverride)?.select;
    const newPriceOverride = await store.priceOverride.create({
        data: {
            endDate,
            startDate,
            hotelRoom: { connect: { id: hotelRoomId } },
            priceScheme: { connect: { id: priceSchemeId } },
        },
        select: priceOverrideSelect,
    });

    Log(newPriceOverride);

    return {
        message: "Successfully added price override in hotel room",
        priceOverride: newPriceOverride,
    };
};

export const addPriceOverrideInHotelRoomTypeDefs = gql`
    type AddPriceOverrideInHotelRoomResult {
        message: String!
        priceOverride: PriceOverrideObject
    }

    type Mutation {
        addPriceOverrideInHotelRoom(
            hotelRoomId: ID!
            priceOverride: AddPriceOverrideInput!
        ): AddPriceOverrideInHotelRoomResult! @auth(requires: [host])
    }
`;

export const addPriceOverrideInHotelRoomResolvers = { Mutation: { addPriceOverrideInHotelRoom } };