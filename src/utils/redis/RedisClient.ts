import { environment } from "@utils/environment";
import { Log } from "@utils/logger";
import Redis, { RedisOptions } from "ioredis";
import DataLoader from "dataloader";

const host = environment.REDIS_HOST !== "[object Object]" ? environment.REDIS_HOST : "localhost";
const port = parseInt(environment.REDIS_PORT) || 6379;

const redisOptions: RedisOptions = {
    host,
    port,
    connectTimeout: 5000,
    reconnectOnError: function (err) {
        Log("Reconnect on error", err);
        var targetError = "READONLY";
        if (err.message.slice(0, targetError.length) === targetError) {
            // Only reconnect when the error starts with "READONLY"
            return true;
        }
    },
    retryStrategy: function (times) {
        Log("Redis Retry", times);
        if (times >= 3) {
            return undefined;
        }
        var delay = Math.min(times * 50, 2000);
        return delay;
    },
};

export default class RedisClient extends Redis {
    private readonly cachePrefix = environment.APP_NAME;

    private loader: DataLoader<string, string | null>;

    private constructor(options: RedisOptions) {
        super(options);
    }

    private initialize() {
        this.loader = new DataLoader((keys) => this.mget(...keys), {
            cache: false,
        });
    }

    static createInstance(): RedisClient {
        const redisClient = new RedisClient(redisOptions);
        redisClient.initialize();
        return redisClient;
    }

    async delete(key: number | string) {
        try {
            Log("[STARTED]: Deleting data from cache.");
            const result = await this.del(`${this.cachePrefix}:${key}`);
            Log("[COMPLETED]: Deleting data from cache.");
            return result > 0;
        } catch (error) {
            Log("[FAILED]: Deleting data from cache.");
            Log(error);
        }
    }

    async deleteMany(pattern: string) {
        Log([`[STARTED]: Deleting from cache with key matching ${pattern}`]);
        const stream = this.scanStream({ match: `${this.cachePrefix}:${pattern}` });
        stream.on("data", (keys) => {
            if (!keys?.length) return;
            Log([`[DELETING]: Deleting ${keys.length} records with key matching ${pattern}`]);
            const pipeline = this.pipeline();
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

    async fetch<D = any>(key: number | string): Promise<D | null | undefined> {
        try {
            Log("[STARTED]: Fetching data from cache.");
            const cacheKey = `${this.cachePrefix}:${key}`;
            const cacheDoc = await this.loader.load(cacheKey);
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
            const keys = await this.keys(`${this.cachePrefix}:${pattern}`);
            Log("[COMPLETED]: Fetching keys from redis cache.", keys);
            return keys;
        } catch (error) {
            Log("[FAILED]: Fetching keys from redis cache.");
            Log(error);
        }
    }

    async store<D = any>(key: number | string, data: D, ttl: number = 300) {
        Log("[STARTED]: Storing data in cache.");
        const cacheKey = `${this.cachePrefix}:${key}`;
        if (Number.isInteger(ttl)) {
            this.set(cacheKey, JSON.stringify(data), "EX", ttl)
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
