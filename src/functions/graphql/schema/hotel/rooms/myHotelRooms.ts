import { IFieldResolver } from "@graphql-tools/utils";
import { Log } from "@utils/logger";
import { gql } from "apollo-server-core";
import { mapSelections } from "graphql-map-selections";
import { Context } from "../../../context";
import { GqlError } from "../../../error";
import { HotelRoomObject, toHotelRoomSelect } from "./HotelRoomObject";

type MyHotelRoomsArgs = {
    hotelId: string;
};

type MyHotelRoomsResult = HotelRoomObject[];

type MyHotelRooms = IFieldResolver<any, Context, MyHotelRoomsArgs, Promise<MyHotelRoomsResult>>;

const myHotelRooms: MyHotelRooms = async (_, { hotelId }, { authData, store }, info) => {
    const { accountId } = authData || {};
    if (!accountId) throw new GqlError({ code: "FORBIDDEN", message: "Invalid token!!" });

    const hotelRoomSelect = toHotelRoomSelect(mapSelections(info))?.select;

    const myHotelRooms = await store.hotelRoom.findMany({
        where: { hotelId },
        select: hotelRoomSelect,
    });

    Log(`hotelId: `, hotelId, `myHotelRooms: `, myHotelRooms);

    return myHotelRooms;
};

export const myHotelRoomsTypeDefs = gql`
    type Query {
        myHotelRooms(hotelId: ID): [HotelRoomObject] @auth(requires: [host])
    }
`;

export const myHotelRoomsResolvers = { Query: { myHotelRooms } };
