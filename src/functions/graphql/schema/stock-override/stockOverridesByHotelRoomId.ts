import { IFieldResolver } from "@graphql-tools/utils";
import { gql } from "apollo-server-core";
import { GqlError } from "../../error";
import { Context } from "../../context";
import { StockOverrideObject, toStockOverrideSelect } from "./StockOverrideObject";
import { mapSelections } from "graphql-map-selections";
import { isEmpty } from "lodash";
import { Log } from "@utils/logger";

type StockOverridesByHotelRoomIdArgs = { hotelRoomId: string };

type StockOverridesByHotelRoomIdResult = StockOverrideObject[];

type StockOverridesByHotelRoomId = IFieldResolver<
    any,
    Context,
    StockOverridesByHotelRoomIdArgs,
    Promise<StockOverridesByHotelRoomIdResult>
>;

const stockOverridesByHotelRoomId: StockOverridesByHotelRoomId = async (
    _,
    { hotelRoomId },
    { authData, store },
    info
) => {
    const stockOverrideSelect = toStockOverrideSelect(mapSelections(info));
    const hotelRoom = await store.hotelRoom.findUnique({
        where: { id: hotelRoomId },
        select: { stockOverrides: stockOverrideSelect },
    });
    if (!hotelRoom) throw new GqlError({ code: "NOT_FOUND", message: "部屋が見つかりません" });

    let stockOverrides = hotelRoom.stockOverrides;
    if (isEmpty(hotelRoom.stockOverrides)) stockOverrides = [];

    Log(stockOverrides);

    return stockOverrides;
};

export const stockOverridesByHotelRoomIdTypeDefs = gql`
    type Query {
        stockOverridesByHotelRoomId(hotelRoomId: ID!): [StockOverrideObject]
    }
`;

export const stockOverridesByHotelRoomIdResolvers = { Query: { stockOverridesByHotelRoomId } };
