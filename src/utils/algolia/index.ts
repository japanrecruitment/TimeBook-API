import { SearchIndex } from "algoliasearch";
import { hotelIndex, spaceIndex } from "./indices";

export type AlgoliaIndices = "hotel" | "space";

export type Algolia = Record<AlgoliaIndices, SearchIndex>;

export const algolia: Algolia = {
    hotel: hotelIndex,
    space: spaceIndex,
};

export * from "./algoliaClient";
export * from "./algoliaRecord";
export * from "./indices";
