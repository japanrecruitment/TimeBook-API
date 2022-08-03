import { Option } from "@prisma/client";
import { omit } from "@utils/object-helper";
import { gql } from "apollo-server-core";
import { PrismaSelect } from "graphql-map-selections";
import { isEmpty } from "lodash";
import { Photo, PhotoSelect, toPhotoSelect } from "../media";
import {
    OptionPriceOverrideObject,
    OptionPriceOverrideSelect,
    toOptionPriceOverrideSelect,
} from "./option-price-override";

export type OptionObject = Partial<Option> & {
    photos?: Partial<Photo>[];
    priceOverrides?: Partial<OptionPriceOverrideObject>[];
};

export type OptionSelect = {
    id: boolean;
    name: boolean;
    description: boolean;
    startUsage: boolean;
    endUsage: boolean;
    startReservation: boolean;
    endReservation: boolean;
    cutOffBeforeDays: boolean;
    cutOffTillTime: boolean;
    paymentTerm: boolean;
    additionalPrice: boolean;
    stock: boolean;
    photos: PrismaSelect<PhotoSelect>;
    priceOverrides: PrismaSelect<OptionPriceOverrideSelect>;
    createdAt: boolean;
    updatedAt: boolean;
};

export function toOptionSelect(selections, defaultValue: any = false): PrismaSelect<OptionSelect> {
    if (!selections || isEmpty(selections)) return defaultValue;
    const photosSelect = toPhotoSelect(selections.photos);
    const optionPriceOverrideSelect = toOptionPriceOverrideSelect(selections.priceOverrides);
    const optionSelect = omit(selections, "photos", "priceOverrides");
    if (isEmpty(optionSelect) && !photosSelect && !optionPriceOverrideSelect) return defaultValue;

    return {
        select: {
            ...optionSelect,
            photos: photosSelect,
            priceOverrides: optionPriceOverrideSelect,
        } as OptionSelect,
    };
}

export const optionObjectTypeDefs = gql`
    enum OptionPaymentTerm {
        PER_PERSON
        PER_ROOM
        PER_USE
        PER_FLAT
    }

    type OptionObject {
        id: ID
        name: String
        description: String
        startUsage: Date
        endUsage: Date
        startReservation: Date
        endReservation: Date
        cutOffBeforeDays: Int
        cutOffTillTime: Time
        paymentTerm: OptionPaymentTerm
        additionalPrice: Int
        stock: Int
        priceOverrides: [OptionPriceOverrideObject]
        photos: [Photo]
        createdAt: Date
        updatedAt: Date
    }
`;

export const optionObjectResolvers = {};
