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
    dailyPrice?: number;
    hourlyPrice?: number;
    name: string;
    nearestStations?: number[];
    prefecture?: string;
    rating?: number;
    spaceTypes: string[];
    thumbnail?: string;
    updatedAt?: number;
    viewCount?: number;
};

export const spaceIndex = algoliaClient.initIndex(environment.isDev() ? `space_dev` : `space_prod`);

const searchableAttributes = ["name", "spaceTypes"];
const customRanking = ["desc(updatedAt)", "desc(viewCount)", "desc(rating)"];

const settings: Settings = {
    searchableAttributes,
    customRanking,
};

spaceIndex.setSettings(settings).catch((error) => Log("[FAILED]: setting space index", error));
