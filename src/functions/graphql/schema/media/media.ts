import { omit } from "@utils/object-helper";
import { gql } from "apollo-server-core";
import { PrismaSelect } from "graphql-map-selections";
import { isEmpty } from "lodash";

export type ImageTypes = "Profile" | "Cover" | "General";

export type ImageUploadInput = {
    mime: string;
};

export type ImageUploadResult = {
    type: ImageTypes;
    url: string;
    mime: string;
    key: string;
};

export type Image = {
    width: number;
    height: number;
    url: string;
};

export type Photo = {
    id: string;
    mime: string;
    type: ImageTypes;
    thumbnail: Image | any;
    small: Image | any;
    medium: Image | any;
    large: Image | any;
};

export type PhotoSelect = {
    id: boolean;
    mime: boolean;
    type: boolean;
    thumbnail: boolean;
    small: boolean;
    medium: boolean;
    large: boolean;
};

export const toPhotoSelect = (selections: any, defaultValue: any = false): PrismaSelect<PhotoSelect> => {
    if (!selections || isEmpty(selections)) return defaultValue;

    const thumbnailSelect = selections.thumbnail !== undefined;
    const mediumSelect = selections.medium !== undefined;
    const smallSelect = selections.small !== undefined;
    const largeSelect = selections.large !== undefined;
    const photoSelect = omit(selections, "thumbnail", "small", "medium", "large");

    if (isEmpty(photoSelect) && !thumbnailSelect && !mediumSelect && !smallSelect && !largeSelect) return defaultValue;

    return {
        select: {
            ...photoSelect,
            thumbnail: thumbnailSelect,
            medium: mediumSelect,
            small: smallSelect,
            large: largeSelect,
        } as PhotoSelect,
    };
};

export const MediaTypeDefs = gql`
    enum ImageType {
        Profile
        Cover
        General
    }

    input ImageUploadInput {
        mime: String!
    }

    type ImageUploadResult {
        type: ImageType!
        url: String!
        mime: String!
        key: String!
    }

    type Image {
        width: Int
        height: Int
        url: String @signMediaRead
    }

    type Photo {
        id: ID!
        mime: String!
        type: ImageType!
        thumbnail: Image
        small: Image
        medium: Image
        large: Image
    }
`;

export const MediaResolvers = {};
