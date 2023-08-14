import { IFieldResolver } from "@graphql-tools/utils";
import { Log } from "@utils/logger";
import { gql } from "apollo-server-core";
import { mapSelections } from "graphql-map-selections";
import { Context } from "../../context";
import { GqlError } from "../../error";
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
    if (!accountId) throw new GqlError({ code: "FORBIDDEN", message: "無効なリクエスト" });

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
        throw new GqlError({ code: "NOT_FOUND", message: "在庫の上書きが見つかりません" });
    if (accountId !== stockOverride.hotelRoom.hotel.accountId)
        throw new GqlError({ code: "FORBIDDEN", message: "無効なリクエスト" });
    if (!isEmpty(stockOverride.hotelRoom.stockOverrides))
        throw new GqlError({ code: "BAD_REQUEST", message: "重複する在庫の上書きが見つかりました" });

    const stockOverrideSelect = toStockOverrideSelect(mapSelections(info)?.stockOverride)?.select;
    const newStockOverride = await store.stockOverride.update({
        where: { id },
        data: { endDate, startDate, stock },
        select: stockOverrideSelect,
    });

    Log(newStockOverride);

    return {
        message: "在庫の上書きが更新されました",
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
