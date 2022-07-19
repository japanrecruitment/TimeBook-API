import { IFieldResolver } from "@graphql-tools/utils";
import { Log } from "@utils/logger";
import { gql } from "apollo-server-core";
import { mapSelections } from "graphql-map-selections";
import { Context } from "../../../context";
import { GqlError } from "../../../error";
import { UpdateStockOverrideInput, validateUpdateStockOverrideInput } from "./updateStockOverride";
import { StockOverrideObject, toStockOverrideSelect } from "./StockOverrideObject";
import { isEmpty } from "lodash";

type UpdateStockOverrideInHotelRoomArgs = {
    input: UpdateStockOverrideInput;
};

type UpdateStockOverrideInHotelRoomResult = {
    message: string;
    stockOverride?: StockOverrideObject;
};

type UpdateStockOverrideInHotelRoom = IFieldResolver<
    any,
    Context,
    UpdateStockOverrideInHotelRoomArgs,
    Promise<UpdateStockOverrideInHotelRoomResult>
>;

const updateStockOverrideInHotelRoom: UpdateStockOverrideInHotelRoom = async (
    _,
    { input },
    { authData, store },
    info
) => {
    const { accountId } = authData || {};
    if (!accountId) throw new GqlError({ code: "FORBIDDEN", message: "Invalid token!!" });

    const { id, endDate, startDate, stock } = validateUpdateStockOverrideInput(input);

    const stockOverride = await store.stockOverride.findUnique({
        where: { id },
        select: {
            hotelRoom: {
                select: {
                    hotel: { select: { accountId: true } },
                    stockOverrides:
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
    if (!stockOverride || !stockOverride.hotelRoom?.hotel)
        throw new GqlError({ code: "NOT_FOUND", message: "Stock override not found" });
    if (accountId !== stockOverride.hotelRoom.hotel.accountId)
        throw new GqlError({ code: "FORBIDDEN", message: "You are not allowed to modify this hotel room" });
    if (!isEmpty(stockOverride.hotelRoom.stockOverrides))
        throw new GqlError({ code: "BAD_REQUEST", message: "Overlapping stock override found." });

    const stockOverrideSelect = toStockOverrideSelect(mapSelections(info)?.stockOverride)?.select;
    const newStockOverride = await store.stockOverride.update({
        where: { id },
        data: { endDate, startDate, stock },
        select: stockOverrideSelect,
    });

    Log(newStockOverride);

    return {
        message: "Successfully updated stock override in hotel room",
        stockOverride: newStockOverride,
    };
};

export const updateStockOverrideInHotelRoomTypeDefs = gql`
    type UpdateStockOverrideInHotelRoomResult {
        message: String!
        stockOverride: StockOverrideObject
    }

    type Mutation {
        updateStockOverrideInHotelRoom(input: UpdateStockOverrideInput!): UpdateStockOverrideInHotelRoomResult!
            @auth(requires: [host])
    }
`;

export const updateStockOverrideInHotelRoomResolvers = { Mutation: { updateStockOverrideInHotelRoom } };
