import { IFieldResolver } from "@graphql-tools/utils";
import { BuildingType } from "@prisma/client";
import { Log } from "@utils/logger";
import { gql } from "apollo-server-core";
import { mapSelections } from "graphql-map-selections";
import { isEmpty } from "lodash";
import { Context } from "../../context";
import { GqlError } from "../../error";
import { HotelObject, toHotelSelect } from "./HotelObject";

function validateUpdateHotelInput(input: UpdateHotelInput): UpdateHotelInput {
    let { id, buildingType, description, cancelPolicyId, checkInTime, checkOutTime, isPetAllowed, name } = input;

    description = description?.trim();
    name = name?.trim();
    if (!cancelPolicyId) cancelPolicyId = null;

    if (isEmpty(description)) description = undefined;

    if (isEmpty(name)) name = undefined;

    if (!buildingType && !description && !checkInTime && !checkOutTime && !name)
        throw new GqlError({ code: "BAD_USER_INPUT", message: "Empty Input" });

    return { id, buildingType, description, cancelPolicyId, checkInTime, checkOutTime, isPetAllowed, name };
}

type UpdateHotelInput = {
    id: string;
    name: string;
    description: string;
    cancelPolicyId: string;
    checkInTime: Date;
    checkOutTime: Date;
    buildingType: BuildingType;
    isPetAllowed: boolean;
};

type UpdateHotelArgs = { input: UpdateHotelInput };

type UpdateHotelResult = {
    message: string;
    hotel?: HotelObject;
};

type UpdateHotel = IFieldResolver<any, Context, UpdateHotelArgs, Promise<UpdateHotelResult>>;

const updateHotel: UpdateHotel = async (_, { input }, { authData, dataSources, store }, info) => {
    const { accountId } = authData || {};
    if (!accountId) throw new GqlError({ code: "FORBIDDEN", message: "Invalid token!!" });

    const { id, ...data } = validateUpdateHotelInput(input);

    const hotel = await store.hotel.findFirst({ where: { id, accountId } });
    if (!hotel) throw new GqlError({ code: "NOT_FOUND", message: "Hotel not found" });

    const hotelSelect = toHotelSelect(mapSelections(info)?.hotel)?.select || { id: true };
    const updatedHotel = await store.hotel.update({
        where: { id },
        data,
        select: { ...hotelSelect, id: true, buildingType: true, isPetAllowed: true, name: true, status: true },
    });

    Log(updatedHotel);
    if (
        updatedHotel.status === "PUBLISHED" &&
        (hotel.buildingType !== updatedHotel.buildingType ||
            hotel.isPetAllowed !== updatedHotel.isPetAllowed ||
            hotel.name !== updatedHotel.name)
    ) {
        await dataSources.hotelAlgolia.partialUpdateObject({
            objectID: updatedHotel.id,
            buildingType: updatedHotel.buildingType,
            isPetAllowed: updatedHotel.isPetAllowed,
            name: updatedHotel.name,
        });
    }

    return {
        message: `Successfully updated hotel`,
        hotel: updatedHotel,
    };
};

export const updateHotelTypeDefs = gql`
    input UpdateHotelInput {
        id: ID!
        name: String
        description: String
        cancelPolicyId: ID
        checkInTime: Time
        checkOutTime: Time
        buildingType: BuildingType
        isPetAllowed: Boolean
    }

    type UpdateHotelResult {
        message: String!
        hotel: HotelObject
    }

    type Mutation {
        updateHotel(input: UpdateHotelInput!): UpdateHotelResult @auth(requires: [host])
    }
`;

export const updateHotelResolvers = { Mutation: { updateHotel } };
