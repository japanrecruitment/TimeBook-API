import { IFieldResolver } from "@graphql-tools/utils";
import { Log } from "@utils/logger";
import { gql } from "apollo-server-core";
import { mapSelections } from "graphql-map-selections";
import { Context } from "../../../context";
import { GqlError } from "../../../error";
import { HotelRoomObject, toHotelRoomSelect } from "./HotelRoomObject";

type HotelRoomByIdArgs = {
    id: string;
};

type HotelRoomByIdResult = HotelRoomObject;

type HotelRoomById = IFieldResolver<any, Context, HotelRoomByIdArgs, Promise<HotelRoomByIdResult>>;

const hotelRoomById: HotelRoomById = async (_, { id }, { authData, store }, info) => {
    const { accountId } = authData || {};
    if (!accountId) throw new GqlError({ code: "FORBIDDEN", message: "Invalid token!!" });

    const hotelRoomSelect = toHotelRoomSelect(mapSelections(info))?.select;

    const hotelRoom = await store.hotelRoom.findUnique({
        where: { id },
        select: hotelRoomSelect,
    });

    Log(`id: `, id, `hotelRoomById: `, hotelRoom);

    return hotelRoom;
};

export const hotelRoomByIdTypeDefs = gql`
    type Query {
        hotelRoomById(id: ID!): HotelRoomObject @auth(requires: [host])
    }
`;

export const hotelRoomByIdResolvers = { Query: { hotelRoomById } };
