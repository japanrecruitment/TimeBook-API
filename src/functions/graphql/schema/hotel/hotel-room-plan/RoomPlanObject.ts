import { HotelRoomPlan } from "@prisma/client";
import { omit } from "@utils/object-helper";
import { gql } from "apollo-server-core";
import { PrismaSelect } from "graphql-map-selections";
import { isEmpty } from "lodash";
import { BasicPriceSettingObject, BasicPriceSettingSelect, toBasicPriceSettingSelect } from "../basic-price-setting";
import { PackagePlanObject, PackagePlanSelect, toPackagePlanSelect } from "../package-plan";
import { HotelRoomObject, HotelRoomSelect, toHotelRoomSelect } from "../rooms";

export type HotelRoomPlanObject = Partial<HotelRoomPlan> & {
    hotelRoom?: Partial<HotelRoomObject>;
    packagePlan?: Partial<PackagePlanObject>;
    priceSettings?: Partial<BasicPriceSettingObject>[];
};

export type HotelRoomPlanSelect = {
    id: boolean;
    stock: boolean;
    hotelRoom: PrismaSelect<HotelRoomSelect>;
    packagePlan: PrismaSelect<PackagePlanSelect>;
    priceSettings: PrismaSelect<BasicPriceSettingSelect>;
    createdAt: boolean;
    updatedAt: boolean;
};

export function toHotelRoomPlanSelect(selections, defaultValue: any = false): PrismaSelect<HotelRoomPlanSelect> {
    if (!selections || isEmpty(selections)) return defaultValue;
    const hotelRoomSelect = toHotelRoomSelect(selections.hotelRoom);
    const packagePlanSelect = toPackagePlanSelect(selections.packagePlan);
    const priceSettingsSelect = toBasicPriceSettingSelect(selections.priceSettings);
    const roomPlanSelect = omit(selections, "hotelRoom", "packagePlan", "priceSettings");

    return {
        select: {
            ...roomPlanSelect,
            hotelRoom: hotelRoomSelect,
            packagePlan: packagePlanSelect,
            priceSettings: priceSettingsSelect,
        } as HotelRoomPlanSelect,
    };
}

export const roomPlanObjectTypeDefs = gql`
    type HotelRoomPlanObject {
        id: ID
        stock: Int
        hotelRoom: HotelRoomObject
        packagePlan: PackagePlanObject
        priceSettings: [BasicPriceSettingObject]
        createdAt: Date
        updatedAt: Date
    }
`;

export const roomPlanObjectResolvers = {};
