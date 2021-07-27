import { Log, environment } from "@utils/index";
import { RedisCache } from "apollo-server-cache-redis";

export default new RedisCache({
    host: environment.NODE_ENV === "prod" ? environment.REDIS_HOST : "127.0.0.1",
    port: environment.NODE_ENV === "prod" ? environment.REDIS_PORT : 6379,
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
});
