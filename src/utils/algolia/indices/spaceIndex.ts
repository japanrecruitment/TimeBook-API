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
    nearestStations?: string[];
    prefecture?: string;
    price?: number;
    priceType?: string;
    rating?: number;
    spaceSize?: number;
    spaceTypes: string[];
    thumbnail?: string;
    updatedAt?: number;
    viewCount?: number;
};

export const spaceIndex = algoliaClient.initIndex(environment.isDev() ? `space_dev` : `space_prod`);

const attributesForFaceting = ["searchable(spaceTypes)", "filterOnly(nearestStations)", "filterOnly(prefecture)"];
const customRanking = ["desc(rating)", "desc(viewCount)"];
const ranking = ["desc(updatedAt)", "typo", "geo", "words", "filters", "proximity", "attribute", "exact", "custom"];
const searchableAttributes = ["name", "spaceTypes"];

const settings: Settings = {
    attributesForFaceting,
    customRanking,
    ranking,
    searchableAttributes,
};

spaceIndex.setSettings(settings).catch((error) => Log("[FAILED]: setting space index", error));
