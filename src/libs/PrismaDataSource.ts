import { PrismaClient } from "@prisma/client";
import { DataSource, DataSourceConfig } from "apollo-datasource";
import { InMemoryLRUCache, KeyValueCache } from "apollo-server-caching";

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
            console.log("[STARTED]: Fetching data from cache.");
            const cacheKey = Buffer.from(`${this.cachePrefix}-${key}`).toString("base64");
            const cacheDoc = await this.cache.get(cacheKey);
            console.log(`[${cacheDoc ? "COMPLETED" : "FAILED"}]: Fetching data from cache.`);
            if (cacheDoc) return JSON.parse(cacheDoc);
        } catch (error) {
            console.log("[FAILED]: Fetching data from cache.");
            console.log(error);
        }
    }

    protected async storeInCache<TData = any>(key: number | string, doc: TData, ttl: number) {
        console.log("[STARTED]: Storing data in cache.");
        const cacheKey = Buffer.from(`${this.cachePrefix}-${key}`).toString("base64");
        if (Number.isInteger(ttl)) {
            this.cache
                .set(cacheKey, JSON.stringify(doc), { ttl })
                .then(() => {
                    console.log("[COMPLETED]: Storing data in cache.");
                })
                .catch((error) => {
                    console.log("[FAILED]: Storing data in cache.");
                    console.log(error);
                });
        }
    }

    protected async deleteFromCache(key: number | string) {
        try {
            console.log("[STARTED]: Deleting data from cache.");
            await this.cache.delete(`${this.cachePrefix}-${key}`);
            console.log("[COMPLETED]: Deleting data from cache.");
        } catch (error) {
            console.log("[FAILED]: Deleting data from cache.");
            console.log(error);
        }
    }
}

export default PrismaDataSource;
