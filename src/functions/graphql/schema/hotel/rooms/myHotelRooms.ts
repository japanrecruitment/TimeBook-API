import { IFieldResolver } from "@graphql-tools/utils";
import { Log } from "@utils/logger";
import { gql } from "apollo-server-core";
import { mapSelections } from "graphql-map-selections";
import { isEmpty } from "lodash";
import { Context } from "../../../context";
import { GqlError } from "../../../error";
import {
    createPaginationResult,
    createPaginationResultType,
    PaginationOption,
    PaginationResult,
} from "../../core/pagination";
import { HotelRoomObject, toHotelRoomSelect } from "./HotelRoomObject";

type MyHotelRoomsArgs = {
    hotelId: string;
    paginate: PaginationOption;
};

type MyHotelRoomsResult = PaginationResult<HotelRoomObject>;

type MyHotelRooms = IFieldResolver<any, Context, MyHotelRoomsArgs, Promise<MyHotelRoomsResult>>;

const myHotelRooms: MyHotelRooms = async (_, { hotelId, paginate }, { authData, store }, info) => {
    const { accountId } = authData || { accountId: null };
    if (!accountId) throw new GqlError({ code: "FORBIDDEN", message: "無効なリクエスト" });

    const { skip, take } = paginate || {};

    const hotelRoomSelect = toHotelRoomSelect(mapSelections(info)?.data)?.select;

    const myHotels = await store.hotel.findMany({
        where: { id: hotelId || undefined, accountId },
        select: { rooms: { select: hotelRoomSelect, orderBy: { createdAt: "desc" }, take: take && take + 1, skip } },
        orderBy: { createdAt: "desc" },
    });

    if (hotelId && isEmpty(myHotels)) throw new GqlError({ code: "NOT_FOUND", message: "ホテルが見つかりません" });

    const myHotelRooms = myHotels.flatMap(({ rooms }) => rooms).filter((room) => room);

    Log(`hotelId: `, hotelId, `myHotelRooms: `, myHotelRooms);

    return createPaginationResult(myHotelRooms, take, skip);
};

export const myHotelRoomsTypeDefs = gql`
    ${createPaginationResultType("MyHotelRoomsResult", "HotelRoomObject")}

    type Query {
        myHotelRooms(hotelId: ID, paginate: PaginationOption): MyHotelRoomsResult @auth(requires: [host])
    }
`;

export const myHotelRoomsResolvers = { Query: { myHotelRooms } };
