import { IFieldResolver } from "@graphql-tools/utils";
import { gql } from "apollo-server-core";
import { GqlError } from "../../../error";
import { Context } from "../../../context";
import {
    BasicPriceSettingObject,
    toBasicPriceSettingSelect,
    UpdateBasicPriceSettingInput,
    validateUpdateBasicPriceSettingInputList,
} from "../basic-price-setting";
import { differenceWith } from "lodash";
import { mapSelections } from "graphql-map-selections";
import { Log } from "@utils/logger";

type UpdateHotelRoomPriceSettingArgs = {
    hotelRoomId: string;
    priceSettings: UpdateBasicPriceSettingInput[];
};

type UpdateHotelRoomPriceSettingResult = {
    message: string;
    basicPriceSettings?: BasicPriceSettingObject[];
};

type UpdateHotelRoomPriceSetting = IFieldResolver<
    any,
    Context,
    UpdateHotelRoomPriceSettingArgs,
    Promise<UpdateHotelRoomPriceSettingResult>
>;

const updateHotelRoomPriceSetting: UpdateHotelRoomPriceSetting = async (
    _,
    { hotelRoomId, priceSettings },
    { authData, store },
    info
) => {
    const { accountId } = authData || {};
    if (!accountId) throw new GqlError({ code: "FORBIDDEN", message: "Invalid token!!" });

    priceSettings = validateUpdateBasicPriceSettingInputList(priceSettings);

    const hotelRoom = await store.hotelRoom.findUnique({
        where: { id: hotelRoomId },
        select: {
            hotel: { select: { accountId: true } },
            basicPriceSettings: { where: { id: { in: priceSettings.map(({ id }) => id) } }, select: { id: true } },
        },
    });
    if (!hotelRoom) throw new GqlError({ code: "NOT_FOUND", message: "Hotel room not found" });

    if (accountId !== hotelRoom.hotel.accountId)
        throw new GqlError({ code: "FORBIDDEN", message: "You are not allowed to modify this hotel room" });

    differenceWith(priceSettings, hotelRoom.basicPriceSettings, (a, b) => a.id === b.id).forEach((id) => {
        throw new GqlError({ code: "NOT_FOUND", message: `Basic setting with id: ${id} not found in this hotel room` });
    });

    const basicPriceSettingSelect = toBasicPriceSettingSelect(mapSelections(info)?.priceSettings)?.select;
    const updatedPriceSettings = await Promise.all(
        priceSettings.map(({ id, priceSchemeId }) =>
            store.basicPriceSetting.update({
                where: { id },
                data: { priceScheme: { connect: { id: priceSchemeId } } },
                select: basicPriceSettingSelect,
            })
        )
    );

    Log(updatedPriceSettings);

    return {
        message: `Successfully updated hotel room basic price settings`,
        basicPriceSettings: updatedPriceSettings,
    };
};

export const updateHotelRoomPriceSettingTypeDefs = gql`
    type UpdateHotelRoomPriceSettingResult {
        message: String!
        basicPriceSettings: [BasicPriceSettingObject]
    }

    type Mutation {
        updateHotelRoomPriceSetting(
            hotelRoomId: ID!
            priceSettings: [UpdateBasicPriceSettingInput!]!
        ): [BasicPriceSettingObject] @auth(requires: [host])
    }
`;

export const updateHotelRoomPriceSettingResolvers = { Mutation: { updateHotelRoomPriceSetting } };
