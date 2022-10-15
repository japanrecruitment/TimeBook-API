import { IFieldResolver } from "@graphql-tools/utils";
import { Log } from "@utils/logger";
import { gql } from "apollo-server-core";
import { mapSelections } from "graphql-map-selections";
import { isEmpty } from "lodash";
import { Context } from "../../context";
import { GqlError } from "../../error";
import { AddStockOverrideInput, validateAddStockOverrideInput } from "./addStockOverride";
import { StockOverrideObject, toStockOverrideSelect } from "./StockOverrideObject";

type AddStockOverrideInHotelRoomArgs = {
    hotelRoomId: string;
    stockOverride: AddStockOverrideInput;
};

type AddStockOverrideInHotelRoomResult = {
    message: string;
    stockOverride?: StockOverrideObject;
};

type AddStockOverrideInHotelRoom = IFieldResolver<
    any,
    Context,
    AddStockOverrideInHotelRoomArgs,
    Promise<AddStockOverrideInHotelRoomResult>
>;

const addStockOverrideInHotelRoom: AddStockOverrideInHotelRoom = async (
    _,
    { hotelRoomId, stockOverride },
    { authData, store },
    info
) => {
    const { accountId } = authData || {};
    if (!accountId) throw new GqlError({ code: "FORBIDDEN", message: "Invalid token!!" });

    const { endDate, startDate, stock } = validateAddStockOverrideInput(stockOverride);

    const hotelRoom = await store.hotelRoom.findUnique({
        where: { id: hotelRoomId },
        select: {
            hotel: { select: { accountId: true } },
            stockOverrides: {
                where: {
                    hotelRoomId,
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
    if (!isEmpty(hotelRoom.stockOverrides))
        throw new GqlError({ code: "BAD_REQUEST", message: "Overlapping stock override found." });

    const stockOverrideSelect = toStockOverrideSelect(mapSelections(info)?.stockOverride)?.select;
    const newStockOverride = await store.stockOverride.create({
        data: {
            endDate,
            startDate,
            stock,
            hotelRoom: { connect: { id: hotelRoomId } },
        },
        select: stockOverrideSelect,
    });

    Log(newStockOverride);

    return {
        message: "Successfully added stock override in hotel room",
        stockOverride: newStockOverride,
    };
};

export const addStockOverrideInHotelRoomTypeDefs = gql`
    type AddStockOverrideInHotelRoomResult {
        message: String!
        stockOverride: StockOverrideObject
    }

    type Mutation {
        addStockOverrideInHotelRoom(
            hotelRoomId: ID!
            stockOverride: AddStockOverrideInput!
        ): AddStockOverrideInHotelRoomResult! @auth(requires: [host])
    }
`;

export const addStockOverrideInHotelRoomResolvers = { Mutation: { addStockOverrideInHotelRoom } };
