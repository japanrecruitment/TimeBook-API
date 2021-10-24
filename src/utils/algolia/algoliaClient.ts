import algoliasearch, { SearchClient } from "algoliasearch";
import { environment } from "../environment";

export type AlgoliaClient = SearchClient;

export const algoliaClient: AlgoliaClient = algoliasearch(
    environment.ALGOLIA_APP_ID,
    environment.ALGOLIA_ADMIN_API_KEY
);
