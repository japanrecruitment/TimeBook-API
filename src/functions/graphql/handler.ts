import { merge } from "lodash";
import { ApolloServer, makeExecutableSchema } from "apollo-server-lambda";
import { formatApolloErrors } from "apollo-server-errors";
import { RedisClusterCache } from "apollo-server-cache-redis";
import responseCachePlugin from "apollo-server-plugin-response-cache";
import { environment } from "@utils/index";
import { AuthenticatedUser } from "@libs/authorizer";
import { coreResolvers, coreTypedefs } from "./core";
import { AuthDirective, SelfDirective, UpperFirstLetterDirective } from "./core/directives";
import { SessionDS, UserDS, userResolvers, userTypeDefs } from "./users";
import { StationDS, stationResolvers, stationTypeDefs } from "./stations";
import GQLError from "./core/GQLError";

const typeDefs = [coreTypedefs, userTypeDefs, stationTypeDefs];

const resolvers = merge(coreResolvers, userResolvers, stationResolvers);

const schemaDirectives = {
    upperFirstLetter: UpperFirstLetterDirective,
    self: SelfDirective,
    auth: AuthDirective,
};

/* tslint:disable:top-level-await */
const schema = makeExecutableSchema({
    typeDefs,
    schemaDirectives,
    resolvers,
});

// const cache = new RedisClusterCache(
//     [
//         {
//             host: process.env.REDIS_HOST,
//             port: process.env.REDIS_PORT,
//         },
//     ],
//     {
//         clusterRetryStrategy: function (times) {
//             console.log("Redis Retry", times);
//             if (times >= 3) return undefined;
//             var delay = Math.min(times * 50, 2000);
//             return delay;
//         },
//         slotsRefreshTimeout: 3000,
//         dnsLookup: (hostname, callback) => callback(null, hostname),
//         redisOptions: {
//             reconnectOnError: function (err) {
//                 console.log("Reconnect on error", err);
//                 var targetError = "READONLY";
//                 // Only reconnect when the error starts with "READONLY"
//                 if (err.message.slice(0, targetError.length) === targetError) return true;
//             },
//             tls: {},
//         },
//     }
// );

const server = new ApolloServer({
    schema,
    // cache,
    cacheControl: {
        defaultMaxAge: 300,
    },
    formatError: GQLError.formatError,
    dataSources: () => ({
        userDS: new UserDS(),
        sessionDS: new SessionDS(),
        stationDS: new StationDS(),
    }),
    plugins: [
        responseCachePlugin({
            sessionId: (requestContext) => {
                return requestContext.request.http.headers.get("sessionid") || null;
            },
        }),
    ],
    context: async ({ event, context }) => {
        // assign principal with new AuthenticatedUser helper class
        const principal = new AuthenticatedUser(event);

        const { sourceIp, userAgent } = event.requestContext.identity;

        return {
            headers: event.headers,
            functionName: context.functionName,
            event,
            context,
            principal,
            sourceIp,
            userAgent,
        };
    },
    introspection: environment.isDev(),
    playground: environment.isDev(),
    debug: environment.isDev(),
});

export const main = server.createHandler();
