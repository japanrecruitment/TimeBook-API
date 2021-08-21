import { Log } from "@utils/index";
import { DataSource, DataSourceConfig } from "apollo-datasource";
import { RedisCache } from "apollo-server-cache-redis";
import IORedis, { Redis } from "ioredis";

export default class CacheDataSource<TContext = any> extends DataSource {
    protected context: TContext;
    private cache: RedisCache;
    private cachePrefix = `cache-data-source`;

    private get client(): Redis {
        return this.cache?.client instanceof IORedis && this.cache.client;
    }

    initialize({ context, cache }: DataSourceConfig<TContext>) {
        this.context = context;
        this.cache = cache instanceof RedisCache && cache;
    }

    async delete(key: number | string) {
        try {
            Log("[STARTED]: Deleting data from cache.");
            await this.cache.delete(`${this.cachePrefix}-${key}`);
            Log("[COMPLETED]: Deleting data from cache.");
        } catch (error) {
            Log("[FAILED]: Deleting data from cache.");
            Log(error);
        }
    }

    async deleteMany(pattern: string) {
        Log([`[STARTED]: Deleting from cache with key matching ${pattern}`]);
        const stream = this.client.scanStream({ match: `${this.cachePrefix}-${pattern}` });
        stream.on("data", (keys) => {
            if (!keys?.length) return;
            Log([`[DELETING]: Deleting ${keys.length} records with key matching ${pattern}`]);
            const pipeline = this.client.pipeline();
            keys.forEach((key) => pipeline.del(key));
            pipeline.exec();
        });
        stream.on("end", () => {
            Log([`[COMPLETED]: Deleting from cache with key matching ${pattern}`]);
        });
        stream.on("error", () => {
            Log([`[FAILED]: Deleting from cache with key matching ${pattern}`]);
        });
    }

    async fetchFromCache<TData = any>(key: number | string): Promise<TData | null | undefined> {
        try {
            Log("[STARTED]: Fetching data from cache.");
            const cacheKey = `${this.cachePrefix}-${key}`;
            const cacheDoc = await this.cache?.get(cacheKey);
            Log(`[${cacheDoc ? "COMPLETED" : "FAILED"}]: Fetching data from cache.`);
            if (cacheDoc) return JSON.parse(cacheDoc);
        } catch (error) {
            Log("[FAILED]: Fetching data from cache.");
            Log(error);
        }
    }

    async listKeys(pattern: string = "*") {
        try {
            Log("[STARTED]: Fetching keys from redis cache.");
            const keys = await this.client.keys(pattern);
            Log("[COMPLETED]: Fetching keys from redis cache.", keys);
            return keys;
        } catch (error) {
            Log("[FAILED]: Fetching keys from redis cache.");
            Log(error);
        }
    }

    async storeInCache<TData = any>(key: number | string, doc: TData, ttl: number) {
        Log("[STARTED]: Storing data in cache.");
        const cacheKey = `${this.cachePrefix}-${key}`;
        if (Number.isInteger(ttl)) {
            this.cache
                ?.set(cacheKey, JSON.stringify(doc), { ttl })
                .then(() => {
                    Log("[COMPLETED]: Storing data in cache.");
                })
                .catch((error) => {
                    Log("[FAILED]: Storing data in cache.");
                    Log(error);
                });
        }
    }
}
