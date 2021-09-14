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

    async add(object: R) {
        try {
            await this.index.saveObject(object);
        } catch (error) {
            Log("[FAILED]: adding record in algolia", error);
        }
    }

    async addMany(objects: Array<R>) {
        try {
            await this.index.saveObjects(objects);
        } catch (error) {
            Log("[FAILED]: adding records in algolia", error);
        }
    }

    async update(object: Partial<R> & Required<Pick<R, "objectID">>) {
        try {
            await this.index.partialUpdateObject(object);
        } catch (error) {
            Log("[FAILED]: updating record in algolia", error);
        }
    }

    async updateMany(objects: Array<Partial<R> & Required<Pick<R, "objectID">>>) {
        try {
            await this.index.partialUpdateObjects(objects);
        } catch (error) {
            Log("[FAILED]: updating records in algolia", error);
        }
    }

    async remove(objectID: string) {
        try {
            this.index.deleteObject(objectID);
        } catch (error) {
            Log("[FAILED]: removing record in algolia", error);
        }
    }

    async removeMany(objectIDs: Array<string>) {
        try {
            this.index.deleteObjects(objectIDs);
        } catch (error) {
            Log("[FAILED]: removing records in algolia", error);
        }
    }
}
