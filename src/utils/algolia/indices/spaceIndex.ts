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
    prefecture?: string;
    price?: { amount: number; type: string }[];
    rating?: number;
    spaceSize?: number;
    spaceTypes: string[];
    thumbnail?: string;
    updatedAt?: number;
    viewCount?: number;
};

export const spaceIndex = algoliaClient.initIndex(environment.isDev() ? `space_dev` : `space_prod`);

const settings: Settings = {
    attributesForFaceting: [
        "searchable(spaceTypes)",
        "filterOnly(nearestStations)",
        "filterOnly(prefecture)",
        "filterOnly(price.type)",
    ],
    customRanking: ["desc(rating)", "desc(viewCount)"],
    ranking: ["desc(updatedAt)", "typo", "geo", "words", "filters", "proximity", "attribute", "exact", "custom"],
    searchableAttributes: ["name", "spaceTypes"],
};

spaceIndex.setSettings(settings).catch((error) => Log("[FAILED]: setting space index", error));
