import { Settings } from "@algolia/client-search";
import { environment } from "../../environment";
import { Log } from "../../logger";
import { algoliaClient } from "../algoliaClient";
import { AlgoliaRecord } from "../algoliaRecord";

export type SpaceIndexRecord = AlgoliaRecord & {
    _geoloc?: {
        lat: number;
        lng: number;
    };
    name: string;
    maximumCapacity?: number;
    nearestStations?: number[];
    prefecture?: string;
    price?: number;
    priceType?: string;
    rating?: number;
    spaceId: string;
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
        "filterOnly(priceType)",
    ],
    customRanking: ["desc(rating)", "desc(viewCount)"],
    ranking: ["desc(updatedAt)", "typo", "geo", "words", "filters", "proximity", "attribute", "exact", "custom"],
    searchableAttributes: ["name", "spaceTypes"],
    attributeForDistinct: "spaceId",
    distinct: true,
};

spaceIndex.setSettings(settings).catch((error) => Log("[FAILED]: setting space index", error));
