import { AlgoliaIndices, AlgoliaRecord } from "@utils/algolia";
import { Log } from "@utils/logger";
import { SearchIndex } from "algoliasearch";
import { DataSource } from "apollo-datasource";

export default class AlgoliaDataSource<R extends AlgoliaRecord = AlgoliaRecord> extends DataSource {
    private indexName: string;
    private index: SearchIndex;

    constructor(indexName: AlgoliaIndices) {
        super();
        this.indexName = indexName;
    }

    initialize({ context }) {
        this.index = context.algolia[this.indexName];
    }

    async saveObject(object: R) {
        try {
            const result = await this.index.saveObject(object);
            Log("[ALGOLIA LIB]: saved object");
            Log("[ALGOLIA LIB]: ", result);
        } catch (error) {
            Log("[FAILED]: adding record in algolia", error);
        }
    }

    async saveObjects(objects: Array<R>) {
        try {
            await this.index.saveObjects(objects);
        } catch (error) {
            Log("[FAILED]: adding records in algolia", error);
        }
    }

    async partialUpdateObject(object: Partial<R> & Required<Pick<R, "objectID">>) {
        try {
            await this.index.partialUpdateObject(object);
        } catch (error) {
            Log("[FAILED]: updating record in algolia", error);
        }
    }

    async partialUpdateObjects(objects: Array<Partial<R> & Required<Pick<R, "objectID">>>) {
        try {
            await this.index.partialUpdateObjects(objects);
        } catch (error) {
            Log("[FAILED]: updating records in algolia", error);
        }
    }

    async deleteObject(objectID: string) {
        try {
            this.index.deleteObject(objectID);
        } catch (error) {
            Log("[FAILED]: removing record in algolia", error);
        }
    }

    async deleteObjects(objectIDs: Array<string>) {
        try {
            this.index.deleteObjects(objectIDs);
        } catch (error) {
            Log("[FAILED]: removing records in algolia", error);
        }
    }

    async getPrefectures() {
        try {
            const result = await this.index.searchForFacetValues("prefecture", "", { maxFacetHits: 100 });
            if (result.facetHits.length > 0) {
                return result.facetHits.map((prefecture) => prefecture.value);
            } else {
                return null;
            }
        } catch (error) {
            Log("[FAILED]: get prefectures from algolia", error);
            return null;
        }
    }
    async getCities(searchParams = "") {
        try {
            const result = await this.index.searchForFacetValues("city", "", {
                maxFacetHits: 100,
                filters: searchParams,
            });
            if (result.facetHits.length > 0) {
                return result.facetHits.map((city) => city.value);
            } else {
                return [];
            }
        } catch (error) {
            Log("[FAILED]: get cities from algolia", error);
            return [];
        }
    }
}
