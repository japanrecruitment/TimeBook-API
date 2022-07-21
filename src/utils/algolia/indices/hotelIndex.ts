import { Settings } from "@algolia/client-search";
import { AlgoliaRecord } from "../algoliaRecord";
import { environment } from "../../environment";
import { algoliaClient } from "../algoliaClient";
import { Log } from "@utils/logger";

export type HotelIndexRecord = AlgoliaRecord & {
    _geoloc?: {
        lat: number;
        lng: number;
    };
    name: string;
    city?: string;
    highestPrice?: number;
    hotelRooms?: string[];
    lowestPrice?: number;
    maxAdult?: number;
    maxChild?: number;
    nearestStations?: number[];
    prefecture?: string;
    rating?: number;
    thumbnail?: string;
    updatedAt?: number;
    viewCount?: number;
};

export const hotelIndex = algoliaClient.initIndex(environment.isDev() ? `hotel_dev` : `hotel_prod`);

const settings: Settings = {
    attributesForFaceting: [
        "searchable(hotelRooms)",
        "searchable(prefecture)",
        "searchable(city)",
        "filterOnly(nearestStations)",
        "filterOnly(hightestPrice)",
        "filterOnly(lowestPrice)",
    ],
    customRanking: ["desc(rating)", "desc(viewCount)"],
    ranking: ["desc(updatedAt)", "typo", "geo", "words", "filters", "proximity", "attribute", "exact", "custom"],
    searchableAttributes: ["name", "hotelRooms", "city"],
};

// hotelIndex.setSettings(settings).catch((error) => Log("[FAILED]: setting hotel index", error));