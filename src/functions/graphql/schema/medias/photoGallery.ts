import { Station } from "@prisma/client";
import { gql } from "apollo-server-core";

export type PhotoGallery = {
    id: string;
    original: string;
    medium: string;
    small: string;
    large: string;
};

export const PhotoGalleryTypeDefs = gql`
    type PhotoGallery {
        id: String
        original: String
        medium: String
        small: String
        large: String
    }
`;
