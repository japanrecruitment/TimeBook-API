import { Settings } from "@algolia/client-search";
import { AlgoliaRecord } from "../algoliaRecord";
import { environment } from "../../environment";
import { Log } from "../../logger";
import { algoliaClient } from "../algoliaClient";

export type SpaceIndexRecord = AlgoliaRecord & {
    _geoloc?: {
        lat: number;
        lng: number;
    };
    maximumCapacity?: number;
    name: string;
    nearestStations?: number[];
    numberOfSeats?: number;
    prefecture?: string;
    city?: string;
    price?: { amount: number; duration: number; type: string }[];
    rating?: number;
    spaceSize?: number;
    spaceTypes?: string[];
    availableAmenities?: string[];
    thumbnail?: string;
    updatedAt?: number;
    viewCount?: number;
};

export const spaceIndex = algoliaClient.initIndex(environment.isDev() ? `space_dev` : `space_prod`);

const settings: Settings = {
    attributesForFaceting: [
        "searchable(spaceTypes)",
        "searchable(prefecture)",
        "searchable(city)",
        "searchable(availableAmenities)",
        "filterOnly(nearestStations)",
        "filterOnly(price.type)",
    ],
    customRanking: ["desc(rating)", "desc(viewCount)"],
    ranking: ["desc(updatedAt)", "typo", "geo", "words", "filters", "proximity", "attribute", "exact", "custom"],
    searchableAttributes: ["name", "spaceTypes", "city"],
};

// spaceIndex.setSettings(settings).catch((error) => Log("[FAILED]: setting space index", error));
