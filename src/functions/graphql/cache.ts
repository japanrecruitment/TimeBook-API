import { Log, environment } from "@utils/index";
import { RedisCache } from "apollo-server-cache-redis";

const host = environment.REDIS_HOST !== "[object Object]" ? environment.REDIS_HOST : "localhost";
const port = parseInt(environment.REDIS_PORT) || 6379;

console.log(host, port);

export default new RedisCache({
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
});
