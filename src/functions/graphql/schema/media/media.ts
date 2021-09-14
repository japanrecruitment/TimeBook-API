import { gql } from "apollo-server-core";

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
        url: String @signMediaRead(ttl: 600)
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
