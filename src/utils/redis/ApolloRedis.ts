import { KeyValueCache, KeyValueCacheSetOptions } from "apollo-server-caching";
import RedisClient from "./RedisClient";

export default class ApolloRedis implements KeyValueCache<string> {
    readonly client: RedisClient;

    constructor() {
        this.client = RedisClient.createInstance();
    }

    async set(key: string, value: string, options: KeyValueCacheSetOptions = { ttl: 300 }) {
        await this.client.store(key, value, options.ttl);
    }

    async get(key: string) {
        return await this.client.fetch(key);
    }

    async delete(key: string) {
        return await this.client.delete(key);
    }
}
