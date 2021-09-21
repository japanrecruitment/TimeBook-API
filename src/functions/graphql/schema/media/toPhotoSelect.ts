import { omit } from "@utils/object-helper";
import { PrismaSelect } from "graphql-map-selections";

export type PhotoSelect = {
    id: boolean;
    mime: boolean;
    type: boolean;
    thumbnail: boolean;
    small: boolean;
    medium: boolean;
    large: boolean;
};

export const toPhotoSelect = (selections: any): PrismaSelect<PhotoSelect> => {
    if (!selections) return;

    const thumbnailSelect = selections.thumbnail !== undefined;
    const mediumSelect = selections.medium !== undefined;
    const smallSelect = selections.small !== undefined;
    const largeSelect = selections.large !== undefined;
    const photoSelect = omit(selections, "thumbnail", "small", "medium", "large");

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
