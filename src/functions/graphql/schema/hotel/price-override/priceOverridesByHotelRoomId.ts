import { IFieldResolver } from "@graphql-tools/utils";
import { gql } from "apollo-server-core";
import { GqlError } from "../../../error";
import { Context } from "../../../context";
import { PriceOverrideObject, toPriceOverrideSelect } from "./PriceOverrideObject";
import { mapSelections } from "graphql-map-selections";
import { isEmpty } from "lodash";
import { Log } from "@utils/logger";

type PriceOverridesByHotelRoomIdArgs = { hotelRoomId: string };

type PriceOverridesByHotelRoomIdResult = PriceOverrideObject[];

type PriceOverridesByHotelRoomId = IFieldResolver<
    any,
    Context,
    PriceOverridesByHotelRoomIdArgs,
    Promise<PriceOverridesByHotelRoomIdResult>
>;

const priceOverridesByHotelRoomId: PriceOverridesByHotelRoomId = async (
    _,
    { hotelRoomId },
    { authData, store },
    info
) => {
    const { accountId } = authData || {};
    if (!accountId) throw new GqlError({ code: "FORBIDDEN", message: "Invalid token!!" });

    const priceOverrideSelect = toPriceOverrideSelect(mapSelections(info));
    const hotelRoom = await store.hotelRoom.findUnique({
        where: { id: hotelRoomId },
        select: {
            hotel: { select: { accountId: true } },
            priceOverrides: priceOverrideSelect,
        },
    });
    if (!hotelRoom || !hotelRoom.hotel) throw new GqlError({ code: "NOT_FOUND", message: "Hotel room not found" });
    if (accountId !== hotelRoom.hotel.accountId)
        throw new GqlError({ code: "FORBIDDEN", message: "You are not allowed to modify this hotel room" });

    let priceOverrides = hotelRoom.priceOverrides;
    if (isEmpty(hotelRoom.priceOverrides)) priceOverrides = [];

    Log(priceOverrides);

    return priceOverrides;
};

export const priceOverridesByHotelRoomIdTypeDefs = gql`
    type Query {
        priceOverridesByHotelRoomId(hotelRoomId: ID!): [PriceOverrideObject] @auth(requires: [host])
    }
`;

export const priceOverridesByHotelRoomIdResolvers = { Query: { priceOverridesByHotelRoomId } };
