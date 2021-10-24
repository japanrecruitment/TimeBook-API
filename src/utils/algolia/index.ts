import { SearchIndex } from "algoliasearch";
import { spaceIndex } from "./indices";

export type AlgoliaIndices = "space";

export type Algolia = Record<AlgoliaIndices, SearchIndex>;

export const algolia: Algolia = {
    space: spaceIndex,
};

export * from "./algoliaClient";
export * from "./algoliaRecord";
export * from "./indices";
