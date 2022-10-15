import { IFieldResolver } from "@graphql-tools/utils";
import { Log } from "@utils/logger";
import { gql } from "apollo-server-core";
import { mapSelections } from "graphql-map-selections";
import { Context } from "../../context";
import { GqlError } from "../../error";
import { HotelObject, toHotelSelect } from "./HotelObject";

type HotelByIdArgs = {
    id: string;
};

type HotelByIdResult = HotelObject;

type HotelById = IFieldResolver<any, Context, HotelByIdArgs, Promise<HotelByIdResult>>;

const hotelById: HotelById = async (_, { id }, { store }, info) => {
    const hotelSelect = toHotelSelect(mapSelections(info))?.select;

    const hotel = await store.hotel.findUnique({ where: { id }, select: hotelSelect });

    Log(`hotelById: `, hotel);

    if (!hotel) throw new GqlError({ code: "NOT_FOUND", message: "Hotel not found" });

    return hotel;
};

export const hotelByIdTypeDefs = gql`
    type Query {
        hotelById(id: ID!): HotelObject
    }
`;

export const hotelByIdResolvers = { Query: { hotelById } };
