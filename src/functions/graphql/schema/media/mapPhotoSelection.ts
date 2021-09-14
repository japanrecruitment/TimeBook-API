import { Log } from "@utils/logger";
import { merge } from "lodash";

export const mapPhotoSelection = (photo: any) => {
    if (!photo) return false;
    const photoSelections = merge(photo, {
        thumbnail: photo.thumbnail !== undefined,
        medium: photo.medium !== undefined,
        small: photo.small !== undefined,
        large: photo.large !== undefined,
    });
    return photoSelections;
};
