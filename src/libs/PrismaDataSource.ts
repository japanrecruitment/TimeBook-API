import { PrismaClient } from "@prisma/client";
import { DataSource, DataSourceConfig } from "apollo-datasource";
import { InMemoryLRUCache, KeyValueCache } from "apollo-server-caching";
import { Log } from "@utils/index";

const store = new PrismaClient();
abstract class PrismaDataSource<TContext = any> extends DataSource {
    protected store: PrismaClient = store;
    protected context: TContext;
    private cache: KeyValueCache;

    private get cachePrefix() {
        return `prisma-ds-cache`;
    }

    initialize(config: DataSourceConfig<TContext>) {
        this.context = config.context;
        this.cache = config.cache || new InMemoryLRUCache();
    }

    protected async fetchFromCache<TData = any>(key: number | string): Promise<TData | null | undefined> {
        try {
            Log("[STARTED]: Fetching data from cache.");
            const cacheKey = Buffer.from(`${this.cachePrefix}-${key}`).toString("base64");
            const cacheDoc = await this.cache.get(cacheKey);
            Log(`[${cacheDoc ? "COMPLETED" : "FAILED"}]: Fetching data from cache.`);
            if (cacheDoc) return JSON.parse(cacheDoc);
        } catch (error) {
            Log("[FAILED]: Fetching data from cache.");
            Log(error);
        }
    }

    protected async storeInCache<TData = any>(key: number | string, doc: TData, ttl: number) {
        Log("[STARTED]: Storing data in cache.");
        const cacheKey = Buffer.from(`${this.cachePrefix}-${key}`).toString("base64");
        if (Number.isInteger(ttl)) {
            this.cache
                .set(cacheKey, JSON.stringify(doc), { ttl })
                .then(() => {
                    Log("[COMPLETED]: Storing data in cache.");
                })
                .catch((error) => {
                    Log("[FAILED]: Storing data in cache.");
                    Log(error);
                });
        }
    }

    protected async deleteFromCache(key: number | string) {
        try {
            Log("[STARTED]: Deleting data from cache.");
            await this.cache.delete(`${this.cachePrefix}-${key}`);
            Log("[COMPLETED]: Deleting data from cache.");
        } catch (error) {
            Log("[FAILED]: Deleting data from cache.");
            Log(error);
        }
    }
}

export default PrismaDataSource;
