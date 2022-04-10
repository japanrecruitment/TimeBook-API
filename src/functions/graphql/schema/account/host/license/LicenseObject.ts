import { License } from "@prisma/client";
import { omit, pick } from "@utils/object-helper";
import { gql } from "apollo-server-core";
import { PrismaSelect } from "graphql-map-selections";
import { isEmpty } from "lodash";
import { Photo, PhotoSelect, toPhotoSelect } from "../../../media";

export type LicenseObject = Partial<License> & {
    photos?: Partial<Photo>[];
};

export type LicenseSelect = {
    id: boolean;
    hostId: boolean;
    type: boolean;
    approved: boolean;
    remarks: boolean;
    createdAt: boolean;
    updatedAt: boolean;
    photos: PrismaSelect<PhotoSelect>;
};

export const toLicenseSelect = (selections, defaultValue: any = false): PrismaSelect<LicenseSelect> => {
    if (!selections || isEmpty(selections)) return defaultValue;
    const photosSelect = toPhotoSelect(selections?.photos);
    const licenseSelect = omit(selections, "photos");

    if (isEmpty(licenseSelect) && !photosSelect) return defaultValue;

    return {
        select: {
            ...licenseSelect,
            photos: photosSelect,
        } as LicenseSelect,
    };
};

export const licenseObjectTypeDefs = gql`
    type LicenseObject {
        id: ID!
        hostId: ID
        type: String
        approved: Boolean
        remarks: String
        photos: [Photo]
        createdAt: Date
        updatedAt: Date
    }
`;
