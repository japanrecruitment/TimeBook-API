import { environment } from "@utils/environment";
import { RedisCache } from "apollo-server-cache-redis";

export default new RedisCache({
    host: environment.REDIS_HOST,
    port: environment.REDIS_PORT,
    connectTimeout: 5000,
    reconnectOnError: function (err) {
        console.log("Reconnect on error", err);
        var targetError = "READONLY";
        if (err.message.slice(0, targetError.length) === targetError) {
            // Only reconnect when the error starts with "READONLY"
            return true;
        }
    },
    retryStrategy: function (times) {
        console.log("Redis Retry", times);
        if (times >= 3) {
            return undefined;
        }
        var delay = Math.min(times * 50, 2000);
        return delay;
    },
});
