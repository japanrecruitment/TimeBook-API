import { AlgoliaIndices, AlgoliaRecord } from "@utils/algolia";
import { Log } from "@utils/logger";
import { SearchIndex } from "algoliasearch";
import { Context } from "../context";
import CacheDataSource from "./CacheDataSource";

export default class AlgoliaDataSource<R extends AlgoliaRecord = AlgoliaRecord> extends CacheDataSource<Context> {
    private index: SearchIndex;

    constructor(index: AlgoliaIndices) {
        super();
        this.index = this.context.algolia[index];
    }

    async add(object: R) {
        try {
            await this.index.saveObject(object);
        } catch (error) {
            Log("[FAILED]: adding record in algolia", error);
        }
    }

    async update(object: Partial<R> & Required<Pick<R, "objectID">>) {
        try {
            await this.index.partialUpdateObject(object);
        } catch (error) {
            Log("[FAILED]: updating record in algolia", error);
        }
    }

    async remove(objectID: string) {
        try {
            this.index.deleteObject(objectID);
        } catch (error) {
            Log("[FAILED]: removing record in algolia", error);
        }
    }
}
