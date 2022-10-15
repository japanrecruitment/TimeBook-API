import { HotelRoom_PackagePlan } from "@prisma/client";
import { omit } from "@utils/object-helper";
import { gql } from "apollo-server-core";
import { PrismaSelect } from "graphql-map-selections";
import { isEmpty } from "lodash";
import { BasicPriceSettingObject, BasicPriceSettingSelect, toBasicPriceSettingSelect } from "../basic-price-setting";
import { HotelRoomObject, HotelRoomSelect, toHotelRoomSelect } from "../rooms";

export type PackagePlanRoomTypeObject = Partial<HotelRoom_PackagePlan> & {
    hotelRoom?: Partial<HotelRoomObject>;
    priceSettings?: Partial<BasicPriceSettingObject>[];
};

export type PackagePlanRoomTypeSelect = {
    id: boolean;
    hotelRoom: PrismaSelect<HotelRoomSelect>;
    priceSettings: PrismaSelect<BasicPriceSettingSelect>;
    createdAt: boolean;
    updatedAt: boolean;
};

export function toPackagePlanRoomTypeSelect(
    selections,
    defaultValue: any = false
): PrismaSelect<PackagePlanRoomTypeSelect> {
    if (!selections || isEmpty(selections)) return defaultValue;
    const hotelRoomSelect = toHotelRoomSelect(selections.hotelRoom);
    const priceSettingsSelect = toBasicPriceSettingSelect(selections.priceSettings);
    const roomPlanSelect = omit(selections, "hotelRoom", "priceSettings");

    return {
        select: {
            ...roomPlanSelect,
            hotelRoom: hotelRoomSelect,
            priceSettings: priceSettingsSelect,
        } as PackagePlanRoomTypeSelect,
    };
}

export const packagePlanRoomTypeObjectTypeDefs = gql`
    type PackagePlanRoomTypeObject {
        id: ID
        hotelRoom: HotelRoomObject
        priceSettings: [BasicPriceSettingObject]
        createdAt: Date
        updatedAt: Date
    }
`;

export const packagePlanRoomTypeObjectResolvers = {};
