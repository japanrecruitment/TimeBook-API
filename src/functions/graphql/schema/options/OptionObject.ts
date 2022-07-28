import { Option } from "@prisma/client";
import { omit } from "@utils/object-helper";
import { gql } from "apollo-server-core";
import { PrismaSelect } from "graphql-map-selections";
import { isEmpty } from "lodash";
import { Photo, PhotoSelect, toPhotoSelect } from "../media";

export type OptionObject = Partial<Option> & {
    photos?: Partial<Photo>[];
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
    photos: PrismaSelect<PhotoSelect>;
    createdAt: boolean;
    updatedAt: boolean;
};

export function toOptionSelect(selections, defaultValue: any = false): PrismaSelect<OptionSelect> {
    if (!selections || isEmpty(selections)) return defaultValue;
    const photosSelect = toPhotoSelect(selections.photos);
    const optionSelect = omit(selections, "photos");
    if (isEmpty(optionSelect) && !photosSelect) return defaultValue;

    return {
        select: {
            ...optionSelect,
            photos: photosSelect,
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
        photos: [Photo]
        createdAt: Date
        updatedAt: Date
    }
`;

export const optionObjectResolvers = {};
