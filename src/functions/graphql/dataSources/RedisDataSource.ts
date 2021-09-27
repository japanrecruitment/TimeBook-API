import { ApolloRedis, RedisClient } from "@utils/redis";
import { DataSource, DataSourceConfig } from "apollo-datasource";

export default class RedisDataSource<TContext = any> extends DataSource {
    protected context: TContext;
    private cache: RedisClient;

    initialize({ context, cache }: DataSourceConfig<TContext>) {
        this.context = context;
        if (cache instanceof ApolloRedis) {
            this.cache = cache.client;
        }
    }

    async delete(key: number | string) {
        await this.cache?.delete(key);
    }

    async deleteMany(pattern: string) {
        await this.cache?.deleteMany(pattern);
    }

    async fetch<D = any>(key: number | string) {
        return await this.cache?.fetch<D>(key);
    }

    async listKeys(pattern: string = "*") {
        return await this.cache?.listKeys(pattern);
    }

    async store<D = any>(key: number | string, data: D, ttl: number = 300) {
        await this.cache?.store(key, data, ttl);
    }
}
