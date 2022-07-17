import { IFieldResolver } from "@graphql-tools/utils";
import { HotelPaymentTerm } from "@prisma/client";
import { Log } from "@utils/logger";
import { gql } from "apollo-server-core";
import { mapSelections } from "graphql-map-selections";
import { isEmpty } from "lodash";
import { Context } from "../../../context";
import { GqlError } from "../../../error";
import { HotelRoomObject, toHotelRoomSelect } from "./HotelRoomObject";

function validateUpdateHotelInput(input: UpdateHotelRoomInput): UpdateHotelRoomInput {
    let { id, description, maxCapacityAdult, maxCapacityChild, name, paymentTerm, stock } = input;

    description = description?.trim();
    name = name?.trim();

    if (isEmpty(description)) description = undefined;

    if (isEmpty(name)) name = undefined;

    if (maxCapacityAdult && maxCapacityAdult < 0)
        throw new GqlError({ code: "BAD_USER_INPUT", message: "Invalid maximum adult capacity" });

    if (maxCapacityChild && maxCapacityChild < 0)
        throw new GqlError({ code: "BAD_USER_INPUT", message: "Invalid maximum child capacity" });

    if (stock && stock < 0) throw new GqlError({ code: "BAD_USER_INPUT", message: "Invalid number of stock" });

    if (!description && !maxCapacityAdult && !maxCapacityChild && !name && !paymentTerm && !stock)
        throw new GqlError({ code: "BAD_USER_INPUT", message: "Empty Input" });

    return { id, description, maxCapacityAdult, maxCapacityChild, name, paymentTerm, stock };
}

type UpdateHotelRoomInput = {
    id: string;
    name?: string;
    description?: string;
    paymentTerm?: HotelPaymentTerm;
    maxCapacityAdult?: number;
    maxCapacityChild?: number;
    stock?: number;
};

type UpdateHotelRoomArgs = { input: UpdateHotelRoomInput };

type UpdateHotelRoomResult = {
    message: string;
    hotelRoom?: HotelRoomObject;
};

type UpdateHotelRoom = IFieldResolver<any, Context, UpdateHotelRoomArgs, Promise<UpdateHotelRoomResult>>;

const updateHotelRoom: UpdateHotelRoom = async (_, { input }, { authData, store }, info) => {
    const { accountId } = authData || {};
    if (!accountId) throw new GqlError({ code: "FORBIDDEN", message: "Invalid token!!" });

    const { id, ...data } = validateUpdateHotelInput(input);

    const hotelRoom = await store.hotelRoom.findUnique({
        where: { id },
        select: { hotel: { select: { accountId: true } } },
    });
    if (!hotelRoom) throw new GqlError({ code: "NOT_FOUND", message: "Hotel room not found" });
    if (accountId !== hotelRoom.hotel.accountId)
        throw new GqlError({ code: "FORBIDDEN", message: "You are not allowed to modify this hotel room" });

    const hotelRoomSelect = toHotelRoomSelect(mapSelections(info)?.hotelRoom)?.select;
    const updatedHotelRoom = await store.hotelRoom.update({ where: { id }, data, select: hotelRoomSelect });

    Log(updatedHotelRoom);

    return {
        message: "Successfully updated hotel room",
        hotelRoom: updatedHotelRoom,
    };
};

export const updateHotelRoomTypeDefs = gql`
    input UpdateHotelRoomInput {
        id: ID!
        name: String
        description: String
        paymentTerm: HotelPaymentTerm
        maxCapacityAdult: Int
        maxCapacityChild: Int
        stock: Int
    }

    type UpdateHotelRoomResult {
        message: String!
        hotelRoom: HotelRoomObject
    }

    type Mutation {
        updateHotelRoom(input: UpdateHotelRoomInput!): UpdateHotelRoomResult @auth(requires: [host])
    }
`;

export const updateHotelRoomResolvers = { Mutation: { updateHotelRoom } };